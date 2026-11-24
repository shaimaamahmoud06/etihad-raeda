"use client";

import { walk as cfg } from "@/design/motion";

/* The hero walk player: a scroll-scrubbed frame sequence drawn to a canvas.
   Follows web/hero/README.md:
   - manifest.json per variant: frames[i] is the file at scroll position i (holds repeat a file);
   - AVIF first, WebP only where a 1-pixel AVIF probe fails (one format is ever downloaded);
   - loading order: positions 0, 8, 16… first, then every 4th, then the rest;
   - draw to a <canvas> at the screen's pixel density, showing the nearest loaded frame at or
     before the position; phone/ when the viewport is taller than wide, desktop/ otherwise.
   On top of that (§16 of the brief): 6 downloads at a time with up to 3 attempts, only a window
   around the position is decoded, an eased glide with a cross-fade between neighbours, and
   nothing is redrawn while idle. */

export type Variant = "desktop" | "phone";

type Manifest = {
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

export class WalkPlayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private base: string;
  private variant: Variant;
  private onFirstFrame?: () => void;

  private manifest: Manifest | null = null;
  private ext: "avif" | "webp" = "avif";
  /** Unique file names, and the file index shown at each scroll position. */
  private files: string[] = [];
  private fileAt: number[] = [];

  private blobs = new Map<number, Blob>();
  private bitmaps = new Map<number, ImageBitmap>();
  private decoding = new Set<number>();
  private queue: number[] = [];
  private queued = new Set<number>();
  private inFlight = 0;
  private aborter = new AbortController();

  private progress = 0;
  private target = 0;
  private shown = 0;
  private direction = 1;
  private raf = 0;
  private lastTime = 0;
  private lastDrawKey = "";
  private size = { w: 0, h: 0, dpr: 1 };
  private destroyed = false;
  private announced = false;
  private resizeObs: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, opts: { base: string; variant: Variant; onFirstFrame?: () => void }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.base = opts.base;
    this.variant = opts.variant;
    this.onFirstFrame = opts.onFirstFrame;
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
  }

  async start() {
    const [manifest, avif] = await Promise.all([
      fetch(`${this.base}/${this.variant}/manifest.json`, { signal: this.aborter.signal }).then((r) => r.json() as Promise<Manifest>),
      supportsAvif(),
    ]).catch(() => [null, false] as const);
    if (!manifest || this.destroyed) return;
    this.manifest = manifest;
    this.ext = avif ? "avif" : "webp";

    // Holds store a file once and repeat it in the list.
    const index = new Map<string, number>();
    this.fileAt = manifest.frames.map((name) => {
      let i = index.get(name);
      if (i === undefined) {
        i = this.files.length;
        index.set(name, i);
        this.files.push(name);
      }
      return i;
    });

    // Loading order: every 8th position, then every 4th, then the rest.
    const n = manifest.frames.length;
    for (const step of [8, 4, 1]) for (let p = 0; p < n; p += step) this.enqueue(this.fileAt[p]);
    this.resize();
    this.pump();
    this.setProgress(this.progress, true);
  }

  /** Progress through the walk, 0 to 1. */
  setProgress(p: number, jump = false) {
    this.progress = Math.min(1, Math.max(0, p));
    if (!this.manifest) return;
    const t = this.progress * (this.manifest.frames.length - 1);
    if (jump) this.shown = t;
    if (t !== this.target) this.direction = t > this.target ? 1 : -1;
    this.target = t;
    this.decodeWindow();
    this.wake();
  }

  destroy() {
    this.destroyed = true;
    this.aborter.abort();
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.bitmaps.forEach((b) => b.close());
    this.bitmaps.clear();
    this.blobs.clear();
  }

  /* ── Loading ─────────────────────────────────────────────────────── */

  private enqueue(file: number) {
    if (this.queued.has(file)) return;
    this.queued.add(file);
    this.queue.push(file);
  }

  private pump() {
    while (!this.destroyed && this.inFlight < cfg.concurrency && this.queue.length) {
      const file = this.queue.shift()!;
      this.inFlight++;
      this.fetchFile(file).finally(() => {
        this.inFlight--;
        this.pump();
      });
    }
  }

  private async fetchFile(file: number) {
    const url = `${this.base}/${this.variant}/${this.ext}/${this.files[file]}.${this.ext}`;
    for (let attempt = 1; attempt <= cfg.retries; attempt++) {
      try {
        const res = await fetch(url, { signal: this.aborter.signal });
        if (!res.ok) throw new Error(String(res.status));
        this.blobs.set(file, await res.blob());
        this.decodeWindow();
        // Until the first frame is decoded, decode whatever arrives so something shows.
        if (!this.announced) this.decode(file);
        return;
      } catch {
        if (this.destroyed) return;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }

  /* ── Decoding: only a window around the position ─────────────────── */

  private windowFiles(): Set<number> {
    const set = new Set<number>();
    if (!this.manifest) return set;
    const n = this.fileAt.length;
    const pos = Math.round(this.target);
    const ahead = this.direction > 0 ? cfg.decodeAhead : cfg.decodeBehind;
    const behind = this.direction > 0 ? cfg.decodeBehind : cfg.decodeAhead;
    for (let p = Math.max(0, pos - behind); p <= Math.min(n - 1, pos + ahead); p++) set.add(this.fileAt[p]);
    return set;
  }

  private decodeWindow() {
    const want = this.windowFiles();
    for (const f of want) if (this.blobs.has(f)) this.decode(f);
    this.evict(want);
  }

  private decode(file: number) {
    if (this.bitmaps.has(file) || this.decoding.has(file)) return;
    const blob = this.blobs.get(file);
    if (!blob) return;
    this.decoding.add(file);
    createImageBitmap(blob)
      .then((bmp) => {
        this.decoding.delete(file);
        if (this.destroyed) return bmp.close();
        this.bitmaps.set(file, bmp);
        if (!this.announced) {
          this.announced = true;
          this.onFirstFrame?.();
        }
        this.lastDrawKey = "";
        this.wake();
      })
      .catch(() => this.decoding.delete(file));
  }

  /** Release the decoded frames farthest from the position once over budget. */
  private evict(keep: Set<number>) {
    if (this.bitmaps.size <= cfg.decodedBudget) return;
    const pos = Math.round(this.target);
    const posOf = (file: number) => this.fileAt.indexOf(file);
    const candidates = [...this.bitmaps.keys()].filter((f) => !keep.has(f)).sort((a, b) => Math.abs(posOf(b) - pos) - Math.abs(posOf(a) - pos));
    while (this.bitmaps.size > cfg.decodedBudget && candidates.length) {
      const f = candidates.shift()!;
      this.bitmaps.get(f)?.close();
      this.bitmaps.delete(f);
    }
  }

  /* ── Drawing ─────────────────────────────────────────────────────── */

  private resize() {
    const dpr = Math.min(cfg.maxDpr, window.devicePixelRatio || 1);
    const w = Math.round(this.canvas.clientWidth * dpr);
    const h = Math.round(this.canvas.clientHeight * dpr);
    if (w === this.size.w && h === this.size.h) return;
    this.size = { w, h, dpr };
    this.canvas.width = w;
    this.canvas.height = h;
    this.lastDrawKey = "";
    this.wake();
  }

  private wake() {
    if (this.raf || this.destroyed) return;
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.raf = 0;
    const dt = Math.min(64, now - this.lastTime);
    this.lastTime = now;
    // Eased glide toward the scroll position.
    const k = 1 - Math.exp(-dt / cfg.glideMs);
    this.shown += (this.target - this.shown) * k;
    if (Math.abs(this.target - this.shown) < 0.01) this.shown = this.target;
    this.draw();
    if (this.shown !== this.target) this.raf = requestAnimationFrame(this.tick);
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
