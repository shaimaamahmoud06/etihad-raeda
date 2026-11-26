"use client";

import { gsap } from "gsap";
import { walk as cfg } from "@/design/motion";
import { WalkLoader, indexFrames, type FromLoader, type ToLoader } from "./hero-walk-loader";

/* The hero walk player: a scroll-scrubbed frame sequence drawn to a <canvas> (web/hero/README.md):
   manifest.json per variant (frames[i] is the file at scroll position i; holds repeat a file),
   AVIF where a 1-pixel probe decodes, WebP otherwise; phone/ when the viewport is taller than wide.

   Built so the picture is never stuck, never jumps and never flashes:
   - One glided position drives the picture and, through onProgress, the overlays (room labels,
     lines, end card), so text and picture move as one.
   - Downloading and decoding run in a Web Worker; this file only draws. What loads when, and why,
     is in hero-walk-loader.ts. Frames are decoded at full size: decoding straight to a smaller
     size measured 2–3× slower in Chrome.
   - It draws the nearest ready frames on either side of the position, cross-faded by distance,
     so a frame that isn't ready yet shows as a short dissolve, never a freeze and then a jump.
     Early in the load, with coarse frames only, the walk plays as dissolves and sharpens as
     frames arrive.
   - Resizing redraws at once (a resized canvas is blank until drawn again).
   - Off screen, decoded frames are released (the canvas keeps its last picture) and downloads pause.
   - Drawing runs on GSAP's ticker, after the smooth scroll has moved, in the same frame; nothing is
     redrawn while idle. */

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

/** How far (in files) to look on either side for a ready frame before searching them all. */
const SCAN = 64;
const DEV = process.env.NODE_ENV !== "production";

type Options = {
  base: string;
  variant: Variant;
  manifest: Manifest;
  /** Called with the glided progress (0–1) whenever it moves, for everything that moves with the picture. */
  onProgress?: (progress: number) => void;
  /** Where smooth scroll is taking the page, as progress through the walk; null when it isn't
      animating (the player then predicts from the speed). */
  heading?: () => number | null;
  onFirstFrame?: () => void;
};

export class WalkPlayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private opts: Options;
  private loader: LoaderPort;
  private resizeObs: ResizeObserver;

  /** The file at each scroll position, each file's first and last position, and the file names. */
  private fileAt: number[];
  private first: number[];
  private last: number[];
  private names: string[];
  private n: number;
  /** Decoded frames by file, handed over by the loader. */
  private held = new Map<number, ImageBitmap>();

  /** Positions (0 to n - 1): where the scroll is, and the glided position on screen. */
  private target = 0;
  private shown = 0;
  private prevTarget = 0;
  /** The scroll's speed, positions per second, smoothed. */
  private speed = 0;
  private dir: 1 | -1 = 1;
  private reported = -1;
  private sent = { pos: NaN, dest: NaN, dir: 0 };

  private ticking = false;
  private drawn = "";
  private size = { w: 0, h: 0 };
  private cover = { x: 0, y: 0, w: 0, h: 0 };
  private active = true;
  private destroyed = false;
  private announced = false;

  constructor(canvas: HTMLCanvasElement, opts: Options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.opts = opts;
    const { fileAt, first, last, files } = indexFrames(opts.manifest.frames);
    this.fileAt = fileAt;
    this.first = first;
    this.last = last;
    this.names = files;
    this.n = fileAt.length;
    this.loader = new LoaderPort((msg) => this.receive(msg));
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
  }

  async start() {
    const avif = await supportsAvif();
    if (this.destroyed) return;
    const v = this.opts.variant;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    this.loader.send({
      type: "init",
      base: this.opts.base,
      variant: v,
      ext: avif ? "avif" : "webp",
      frames: this.opts.manifest.frames,
      budget: memory !== undefined && memory <= 4 ? cfg.decodedBudget.lowMemory : cfg.decodedBudget[v],
      decoders: cfg.decodeConcurrency[v],
      fetchBackground: cfg.fetch.background[v],
      fetchUrgent: cfg.fetch.urgent,
      retries: cfg.retries,
    });
    this.resize();
    this.sendFocus(true);
    this.wake();
  }

  /** Progress through the walk, 0 to 1. jump: show it at once instead of gliding there. */
  setProgress(p: number, jump = false) {
    this.target = Math.min(1, Math.max(0, p)) * (this.n - 1);
    if (jump) {
      this.shown = this.target;
      this.prevTarget = this.target;
    }
    this.wake();
  }

  /** Load only while the walk is on or near the screen. */
  setActive(on: boolean) {
    if (this.active === on) return;
    this.active = on;
    this.loader.send({ type: "active", on });
    if (on) this.sendFocus(true);
  }

  destroy() {
    this.destroyed = true;
    this.loader.close();
    this.stopTicking();
    this.resizeObs.disconnect();
    this.held.forEach((b) => b.close());
    this.held.clear();
  }

  private receive(msg: FromLoader) {
    if (msg.type === "frame") {
      if (this.destroyed) return msg.bitmap.close();
      this.held.get(msg.file)?.close();
      this.held.set(msg.file, msg.bitmap);
      this.wake();
    } else {
      for (const f of msg.files) {
        this.held.get(f)?.close();
        this.held.delete(f);
      }
    }
  }

  /** Tell the loader where the picture is and where the scroll is heading (when it has changed). */
  private sendFocus(force = false) {
    const lastPos = this.n - 1;
    const h = this.opts.heading?.();
    const smooth = h != null;
    const dest = smooth ? h * lastPos : Math.min(lastPos, Math.max(0, this.target + this.speed * cfg.lookaheadS));
    const pos = this.shown;
    const dir: 1 | -1 = Math.abs(dest - pos) >= 1 ? (dest > pos ? 1 : -1) : this.dir;
    const s = this.sent;
    if (!force && Math.abs(pos - s.pos) < 0.5 && Math.abs(dest - s.dest) < 1 && dir === s.dir) return;
    this.sent = { pos, dest, dir };
    this.loader.send({ type: "focus", pos, dest, dir, speed: this.speed, smooth });
  }

  /* ── The clock ───────────────────────────────────────────────────── */

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
    this.shown += (this.target - this.shown) * (1 - Math.exp(-dt / cfg.glideMs));
    if (Math.abs(this.target - this.shown) < 0.01) this.shown = this.target;
    // The scroll's speed sets the direction and how far ahead to load; a little jitter never turns it.
    const v = ((this.target - this.prevTarget) * 1000) / dt;
    this.prevTarget = this.target;
    this.speed += (v - this.speed) * (1 - Math.exp(-dt / 60));
    if (Math.abs(this.speed) > 4) this.dir = this.speed > 0 ? 1 : -1;

    const p = this.shown / (this.n - 1);
    if (p !== this.reported) {
      this.reported = p;
      this.opts.onProgress?.(p);
    }
    this.draw();
    this.sendFocus();
    if (this.shown === this.target && Math.abs(this.speed) < 1) {
      this.speed = 0;
      this.sendFocus();
      this.stopTicking();
    }
  };

  /* ── Drawing ─────────────────────────────────────────────────────── */

  private resize() {
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    if (!cw || !ch) return;
    const { width: iw, height: ih } = this.opts.manifest;
    // The frame drawn "cover" is this many CSS pixels wide; past the frame's own width, more canvas
    // pixels add no detail, only work.
    const coverW = Math.max(cw, (ch * iw) / ih);
    const dpr = Math.min(cfg.maxDpr, window.devicePixelRatio || 1, iw / coverW);
    const w = Math.round(cw * dpr);
    const h = Math.round(ch * dpr);
    if (w === this.size.w && h === this.size.h) return;
    this.size = { w, h };
    // Resizing clears the canvas…
    this.canvas.width = w;
    this.canvas.height = h;
    const scale = Math.max(w / iw, h / ih);
    this.cover = { w: iw * scale, h: ih * scale, x: (w - iw * scale) / 2, y: (h - ih * scale) / 2 };
    // …so draw again now, before this frame is painted: never a blank frame.
    this.drawn = "";
    this.draw();
  }

  private draw() {
    if (!this.size.w || !this.held.size) return;
    const pick = this.pick(this.shown);
    if (!pick) return;
    const [a, b, alpha] = pick;
    // Nothing is redrawn when the picture would not change.
    const key = `${a}|${b}|${alpha}`;
    if (key === this.drawn) return;
    this.drawn = key;

    const { x, y, w, h } = this.cover;
    const ctx = this.ctx;
    ctx.globalAlpha = 1;
    ctx.drawImage(this.held.get(a)!, x, y, w, h);
    if (b >= 0) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(this.held.get(b)!, x, y, w, h);
      ctx.globalAlpha = 1;
    }
    // Development only: what is on screen, for checking smoothness from the console.
    if (DEV) {
      (window as unknown as { __heroWalk?: object }).__heroWalk = {
        frame: this.names[b >= 0 && alpha >= 0.5 ? b : a],
        blend: b >= 0 ? `${this.names[a]}→${this.names[b]} @${alpha}` : null,
        position: this.shown,
        held: this.held.size,
      };
    }
    if (!this.announced) {
      this.announced = true;
      this.opts.onFirstFrame?.();
    }
  }

  /** What to draw at position x: [file, -1, 0] alone, or [a, b, alpha] with b over a at alpha. */
  private pick(x: number): [number, number, number] | null {
    const f = this.fileAt[Math.min(this.n - 1, Math.max(0, Math.floor(x)))];
    if (this.held.has(f) && x <= this.last[f]) return [f, -1, 0];
    // The nearest ready frames before and after x.
    let lo = -1;
    let hi = -1;
    for (let k = f; k >= 0 && f - k < SCAN; k--) {
      if (this.held.has(k)) {
        lo = k;
        break;
      }
    }
    for (let k = f + 1; k < this.names.length && k - f <= SCAN; k++) {
      if (this.held.has(k)) {
        hi = k;
        break;
      }
    }
    if (lo < 0 && hi < 0) return this.nearestHeld(x);
    if (hi < 0) return [lo, -1, 0];
    if (lo < 0) return [hi, -1, 0];
    // Cross-faded by distance: a frame not ready yet reads as a short dissolve.
    const gap = this.first[hi] - this.last[lo];
    const t = (x - this.last[lo]) / gap;
    if (gap > cfg.blendGap) return [t < 0.5 ? lo : hi, -1, 0];
    const alpha = Math.round(t * 64) / 64;
    if (alpha <= 0) return [lo, -1, 0];
    if (alpha >= 1) return [hi, -1, 0];
    return [lo, hi, alpha];
  }

  private nearestHeld(x: number): [number, number, number] | null {
    let best = -1;
    let bestD = Infinity;
    for (const f of this.held.keys()) {
      const d = x < this.first[f] ? this.first[f] - x : x > this.last[f] ? x - this.last[f] : 0;
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }
    return best < 0 ? null : [best, -1, 0];
  }
}

/** The loader in a Web Worker; on the page itself if a worker can't be created or fails to load. */
class LoaderPort {
  private worker: Worker | null = null;
  private inline: WalkLoader | null = null;
  private heard = false;
  private replay: { init?: ToLoader; active?: ToLoader; focus?: ToLoader } = {};
  private onMessage: (msg: FromLoader) => void;

  constructor(onMessage: (msg: FromLoader) => void) {
    this.onMessage = onMessage;
    try {
      this.worker = new Worker(new URL("./hero-walk.worker.ts", import.meta.url), { type: "module", name: "hero-walk" });
      this.worker.onmessage = (e: MessageEvent<FromLoader>) => {
        this.heard = true;
        onMessage(e.data);
      };
      this.worker.onerror = () => {
        if (!this.heard) this.runInline();
      };
    } catch {
      this.runInline();
    }
  }

  send(msg: ToLoader) {
    if (msg.type === "init" || msg.type === "active" || msg.type === "focus") this.replay[msg.type] = msg;
    if (this.worker) this.worker.postMessage(msg);
    else this.inline?.handle(msg);
  }

  close() {
    this.worker?.terminate();
    this.worker = null;
    this.inline?.handle({ type: "destroy" });
  }

  private runInline() {
    this.worker?.terminate();
    this.worker = null;
    this.inline = new WalkLoader((msg) => this.onMessage(msg));
    const { init, active, focus } = this.replay;
    for (const msg of [init, active, focus]) if (msg) this.inline.handle(msg);
  }
}
