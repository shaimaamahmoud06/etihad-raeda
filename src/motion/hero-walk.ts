"use client";

import { gsap } from "gsap";
import { walk as cfg } from "@/design/motion";

/* The hero walk player: a scroll-scrubbed frame sequence drawn to a canvas.
   Follows web/hero/README.md:
   - manifest.json per variant: frames[i] is the file at scroll position i (holds repeat a file);
   - AVIF first, WebP only where a 1-pixel AVIF probe fails (one format is ever downloaded);
   - a coarse pass (every 8th position) so the scrub works early, then the rest;
   - draw to a <canvas> at the screen's pixel density, showing the nearest loaded frame at or
     before the position; phone/ when the viewport is taller than wide, desktop/ otherwise.

   Built for smoothness on every device:
   - Loading follows the visitor: the frames around the current position come first, then the
     coarse pass, then the rest nearest-first (ahead of the scroll direction before behind).
     The frames around the position are fetched at high priority, everything else at low.
     Loading pauses while the walk is off screen, so it never competes with the rest of the page.
   - Decoding is limited to a few images at a time, nearest first, and each image is decoded
     straight to the size it is drawn at (never larger than the canvas needs).
   - Phones and low-memory devices keep fewer decoded frames, so the tab is never killed for memory.
   - The canvas is never larger than the frames themselves (no pixel work that adds no detail).
   - Drawing runs on GSAP's ticker, in the same frame as the smooth scroll (no frame of lag),
     with an eased glide and a cross-fade between neighbours; nothing is redrawn while idle. */

export type Variant = "desktop" | "phone";

export type Manifest = {
  variant: Variant;
  width: number;
  height: number;
  frames_in_sequence: number;
  frames: string[];
  timeline: number[];
  formats: Record<"avif" | "webp", { dir: string; bytes: number }>;
};

/** A real 1×1 AVIF (550 bytes). */
const AVIF_PROBE =
  "data:image/avif;base64,AAAAGGZ0eXBhdmlmAAAAAGF2aWZtaWYxAAABh21ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAAAAAAAAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAADnBpdG0AAAAAAAEAAAA4aWluZgAAAAAAAgAAABVpbmZlAgAAAAABAABhdjAxAAAAABVpbmZlAgAAAQACAABFeGlmAAAAABppcmVmAAAAAAAAAA5jZHNjAAIAAQABAAAAqmlwcnAAAACIaXBjbwAAABNjb2xybmNseAACAAIABoAAAAAMY2xsaQDLAEAAAAAUaXNwZQAAAAAAAAACAAAAAgAAAChjbGFwAAAAAQAAAAEAAAABAAAAAf/AAAAAgAAA/8AAAACAAAAAAAAJaXJvdAAAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAGmlwbWEAAAAAAAAAAQABB4ECAwaHhIUAAAAsaWxvYwAAAABEAAACAAEAAAABAAAB/QAAACkAAgAAAAEAAAGvAAAATgAAAAFtZGF0AAAAAAAAAIcAAAAGRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAASAAoMAAAAAAZ//AgQEDQgMhcQAZIACCCCKANnVdWnIUJrZDf8lht8KA==";

let avifSupport: Promise<boolean> | null = null;
/** Checked once per page. */
export function supportsAvif(): Promise<boolean> {
  avifSupport ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = AVIF_PROBE;
  });
  return avifSupport;
}

/** phone/ when the viewport is taller than wide (matches the poster's and the end card's orientation query). */
export const variantFor = (): Variant => (matchMedia("(orientation: portrait)").matches ? "phone" : "desktop");

/** Whether createImageBitmap honours resize options here (falls back to full size if not). */
let resizeDecode = true;

export class WalkPlayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private base: string;
  private variant: Variant;
  private onFirstFrame?: () => void;
  private budget: number;
  private maxDecoding: number;
  private maxFetching: number;
  private bundled?: Manifest;

  private manifest: Manifest | null = null;
  private ext: "avif" | "webp" = "avif";
  /** Unique file names, the file shown at each scroll position, and each file's first position. */
  private files: string[] = [];
  private fileAt: number[] = [];
  private posOf: number[] = [];
  /** Coarse positions (every 8th, plus the last), loaded early so the scrub works at once. */
  private coarse: number[] = [];

  private blobs = new Map<number, Blob>();
  private bitmaps = new Map<number, ImageBitmap>();
  private decoding = new Set<number>();
  private requested = new Set<number>();
  private inFlight = 0;
  private active = true;
  private aborter = new AbortController();
  /** The size frames are decoded to (device pixels). */
  private decodeSize = { w: 0, h: 0 };

  private progress = 0;
  private target = 0;
  private shown = 0;
  private direction = 1;
  private ticking = false;
  private lastDrawKey = "";
  private size = { w: 0, h: 0 };
  private destroyed = false;
  private announced = false;
  private resizeObs: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, opts: { base: string; variant: Variant; manifest?: Manifest; onFirstFrame?: () => void }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.base = opts.base;
    this.variant = opts.variant;
    this.onFirstFrame = opts.onFirstFrame;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    this.budget = memory !== undefined && memory <= 4 ? cfg.decodedBudget.lowMemory : cfg.decodedBudget[opts.variant];
    this.maxDecoding = cfg.decodeConcurrency[opts.variant];
    this.maxFetching = cfg.concurrency[opts.variant];
    this.bundled = opts.manifest;
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
  }

  async start() {
    // The frame list is bundled with the page (no round trip); fetched only if it wasn't.
    const [manifest, avif] = await Promise.all([
      this.bundled ??
        fetch(`${this.base}/${this.variant}/manifest.json`, { signal: this.aborter.signal }).then((r) => r.json() as Promise<Manifest>),
      supportsAvif(),
    ]).catch(() => [null, false] as const);
    if (!manifest || this.destroyed) return;
    this.manifest = manifest;
    this.ext = avif ? "avif" : "webp";

    // Holds store a file once and repeat it in the list.
    const index = new Map<string, number>();
    this.fileAt = manifest.frames.map((name, p) => {
      let i = index.get(name);
      if (i === undefined) {
        i = this.files.length;
        index.set(name, i);
        this.files.push(name);
        this.posOf.push(p);
      }
      return i;
    });
    const n = manifest.frames.length;
    for (let p = 0; p < n; p += 8) this.coarse.push(p);
    if (this.coarse[this.coarse.length - 1] !== n - 1) this.coarse.push(n - 1);

    this.resize();
    this.setProgress(this.progress, true);
    this.pump();
  }

  /** Progress through the walk, 0 to 1. */
  setProgress(p: number, jump = false) {
    this.progress = Math.min(1, Math.max(0, p));
    if (!this.manifest) return;
    const t = this.progress * (this.manifest.frames.length - 1);
    if (jump) this.shown = t;
    if (t !== this.target) this.direction = t > this.target ? 1 : -1;
    this.target = t;
    this.pump();
    this.pumpDecodes();
    this.evict();
    this.wake();
  }

  /** Load only while the walk is on or near the screen. */
  setActive(active: boolean) {
    if (this.active === active) return;
    this.active = active;
    if (active) this.pump();
  }

  destroy() {
    this.destroyed = true;
    this.aborter.abort();
    this.stopTicking();
    this.resizeObs.disconnect();
    this.bitmaps.forEach((b) => b.close());
    this.bitmaps.clear();
    this.blobs.clear();
  }

  /* ── Loading: follow the visitor ─────────────────────────────────── */

  private get pos() {
    return Math.round(this.target);
  }

  /** The decode window: positions around the current one, longer ahead in the scroll direction. */
  private windowRange(): [number, number] {
    const n = this.fileAt.length;
    const ahead = this.direction > 0 ? cfg.decodeAhead : cfg.decodeBehind;
    const behind = this.direction > 0 ? cfg.decodeBehind : cfg.decodeAhead;
    return [Math.max(0, this.pos - behind), Math.min(n - 1, this.pos + ahead)];
  }

  /** Next file to fetch, and whether it is urgent (inside the decode window). */
  private pickNext(): { file: number; urgent: boolean } | null {
    const n = this.fileAt.length;
    const free = (p: number) => p >= 0 && p < n && !this.requested.has(this.fileAt[p]);
    const pos = this.pos;
    const d = this.direction;

    // 1. The frames around the position, nearest first, ahead before behind.
    const [lo, hi] = this.windowRange();
    for (let k = 0; k <= hi - lo; k++) {
      if (free(pos + d * k) && pos + d * k >= lo && pos + d * k <= hi) return { file: this.fileAt[pos + d * k], urgent: true };
      if (k > 0 && free(pos - d * k) && pos - d * k >= lo && pos - d * k <= hi) return { file: this.fileAt[pos - d * k], urgent: true };
    }
    // 2. The coarse pass, nearest first.
    let best = -1;
    for (const p of this.coarse) if (free(p) && (best < 0 || Math.abs(p - pos) < Math.abs(best - pos))) best = p;
    if (best >= 0) return { file: this.fileAt[best], urgent: false };
    // 3. Everything else, nearest first; ahead counts as half the distance of behind.
    for (let k = 1; k < 2 * n; k++) {
      const ahead = pos + d * k;
      if (free(ahead)) return { file: this.fileAt[ahead], urgent: false };
      if (k % 2 === 0 && free(pos - (d * k) / 2)) return { file: this.fileAt[pos - (d * k) / 2], urgent: false };
    }
    for (let p = 0; p < n; p++) if (free(p)) return { file: this.fileAt[p], urgent: false };
    return null;
  }

  private pump() {
    while (!this.destroyed && this.manifest && this.inFlight < this.maxFetching) {
      const next = this.pickNext();
      if (!next) return;
      // Off screen, only urgent frames are fetched (none, once the window is loaded).
      if (!this.active && !next.urgent) return;
      this.requested.add(next.file);
      this.inFlight++;
      this.fetchFile(next.file, next.urgent).finally(() => {
        this.inFlight--;
        this.pump();
      });
    }
  }

  private async fetchFile(file: number, urgent: boolean) {
    const url = `${this.base}/${this.variant}/${this.ext}/${this.files[file]}.${this.ext}`;
    for (let attempt = 1; attempt <= cfg.retries; attempt++) {
      try {
        const init: RequestInit & { priority?: "high" | "low" | "auto" } = { signal: this.aborter.signal, priority: urgent ? "high" : "low" };
        const res = await fetch(url, init);
        if (!res.ok) throw new Error(String(res.status));
        this.blobs.set(file, await res.blob());
        this.pumpDecodes();
        return;
      } catch {
        if (this.destroyed) return;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
    // Give up on this file for now; it can be picked again later.
    this.requested.delete(file);
  }

  /* ── Decoding: a few at a time, nearest first, at drawn size ─────── */

  private pumpDecodes() {
    if (!this.manifest || this.destroyed) return;
    // Until something shows, decode whatever has arrived.
    if (!this.announced && this.bitmaps.size === 0 && this.decoding.size === 0) {
      const first = this.blobs.keys().next();
      if (!first.done) this.decode(first.value);
      return;
    }
    const [lo, hi] = this.windowRange();
    const pos = this.pos;
    const d = this.direction;
    for (let k = 0; k <= hi - lo && this.decoding.size < this.maxDecoding; k++) {
      for (const p of k === 0 ? [pos] : [pos + d * k, pos - d * k]) {
        if (p < lo || p > hi || this.decoding.size >= this.maxDecoding) continue;
        const f = this.fileAt[p];
        if (this.blobs.has(f) && !this.bitmaps.has(f) && !this.decoding.has(f)) this.decode(f);
      }
    }
  }

  private decode(file: number) {
    const blob = this.blobs.get(file);
    if (!blob) return;
    this.decoding.add(file);
    const { w, h } = this.decodeSize;
    const sized = resizeDecode && w > 0 && this.manifest && w < this.manifest.width;
    const job = sized
      ? createImageBitmap(blob, { resizeWidth: w, resizeHeight: h, resizeQuality: "high" }).catch(() => {
          resizeDecode = false;
          return createImageBitmap(blob);
        })
      : createImageBitmap(blob);
    job
      .then((bmp) => {
        this.decoding.delete(file);
        if (this.destroyed) return bmp.close();
        this.bitmaps.get(file)?.close();
        this.bitmaps.set(file, bmp);
        if (!this.announced) {
          this.announced = true;
          this.onFirstFrame?.();
        }
        this.lastDrawKey = "";
        this.evict();
        this.wake();
        this.pumpDecodes();
      })
      .catch(() => {
        this.decoding.delete(file);
        this.pumpDecodes();
      });
  }

  /** Release the decoded frames farthest from the position once over budget. */
  private evict() {
    if (this.bitmaps.size <= this.budget) return;
    const [lo, hi] = this.windowRange();
    const shown = this.fileAt[Math.min(this.fileAt.length - 1, Math.floor(this.shown))];
    const pos = this.pos;
    const candidates = [...this.bitmaps.keys()]
      .filter((f) => f !== shown && (this.posOf[f] < lo || this.posOf[f] > hi))
      .sort((a, b) => Math.abs(this.posOf[b] - pos) - Math.abs(this.posOf[a] - pos));
    while (this.bitmaps.size > this.budget && candidates.length) {
      const f = candidates.shift()!;
      this.bitmaps.get(f)?.close();
      this.bitmaps.delete(f);
    }
  }

  /* ── Drawing ─────────────────────────────────────────────────────── */

  private resize() {
    if (!this.canvas.clientWidth) return;
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    const iw = this.manifest?.width ?? (this.variant === "phone" ? 1080 : 1920);
    const ih = this.manifest?.height ?? (this.variant === "phone" ? 1920 : 1080);
    // The frame drawn "cover" is this many CSS pixels wide; past the frame's own width,
    // more canvas pixels add no detail, only work.
    const coverW = Math.max(cw, (ch * iw) / ih);
    const dpr = Math.min(cfg.maxDpr, window.devicePixelRatio || 1, iw / coverW);
    const w = Math.round(cw * dpr);
    const h = Math.round(ch * dpr);
    if (w === this.size.w && h === this.size.h) return;
    this.size = { w, h };
    this.canvas.width = w;
    this.canvas.height = h;

    // Decode frames at the size they are drawn (rounded up a little so small resizes don't re-decode).
    const scale = Math.max(w / iw, h / ih);
    const target = { w: Math.min(iw, Math.ceil((iw * scale) / 16) * 16), h: 0 };
    target.h = Math.round((target.w * ih) / iw);
    const grew = target.w > this.decodeSize.w * 1.15;
    this.decodeSize = target;
    if (grew && this.bitmaps.size) {
      // Sharper frames for the bigger canvas: keep only the one on screen (until its sharper copy
      // lands) and let the decode pump refill the window at the new size, a few at a time.
      const shown = this.fileAt[Math.min(this.fileAt.length - 1, Math.floor(this.shown))];
      for (const [f, bmp] of this.bitmaps) {
        if (f === shown) continue;
        bmp.close();
        this.bitmaps.delete(f);
      }
      if (shown !== undefined && !this.decoding.has(shown)) this.decode(shown);
      this.pumpDecodes();
    }
    this.lastDrawKey = "";
    this.wake();
  }

  private wake() {
    if (this.ticking || this.destroyed) return;
    this.ticking = true;
    gsap.ticker.add(this.tick);
  }

  private stopTicking() {
    if (!this.ticking) return;
    this.ticking = false;
    gsap.ticker.remove(this.tick);
  }

  /** Runs on GSAP's ticker, after the smooth scroll has moved, in the same frame. */
  private tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(64, deltaMs || 16);
    // Eased glide toward the scroll position.
    const k = 1 - Math.exp(-dt / cfg.glideMs);
    this.shown += (this.target - this.shown) * k;
    if (Math.abs(this.target - this.shown) < 0.01) this.shown = this.target;
    this.draw();
    if (this.shown === this.target) this.stopTicking();
  };

  /** The nearest decoded file at or before a position (then after, so there's never a blank). */
  private nearestDecoded(pos: number): number | null {
    for (let p = pos; p >= 0; p--) if (this.bitmaps.has(this.fileAt[p])) return this.fileAt[p];
    for (let p = pos + 1; p < this.fileAt.length; p++) if (this.bitmaps.has(this.fileAt[p])) return this.fileAt[p];
    return null;
  }

  private draw() {
    if (!this.manifest || !this.size.w) return;
    const n = this.fileAt.length;
    const a = Math.min(n - 1, Math.floor(this.shown));
    const frac = this.shown - a;
    const fileA = this.nearestDecoded(a);
    if (fileA === null) return;
    const nextFile = this.fileAt[Math.min(n - 1, a + 1)];
    const fileB = frac > 0.02 && nextFile !== fileA && this.bitmaps.has(nextFile) ? nextFile : null;
    const alpha = fileB === null ? 0 : Math.round(frac * 50) / 50;

    // Nothing is redrawn when the picture would not change.
    const key = `${fileA}|${fileB}|${alpha}|${this.size.w}x${this.size.h}`;
    if (key === this.lastDrawKey) return;
    this.lastDrawKey = key;

    const { w, h } = this.size;
    const { width: iw, height: ih } = this.manifest;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    this.ctx.globalAlpha = 1;
    this.ctx.drawImage(this.bitmaps.get(fileA)!, dx, dy, dw, dh);
    if (fileB !== null && alpha > 0) {
      this.ctx.globalAlpha = alpha;
      this.ctx.drawImage(this.bitmaps.get(fileB)!, dx, dy, dw, dh);
      this.ctx.globalAlpha = 1;
    }
  }
}
