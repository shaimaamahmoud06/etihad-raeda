/* The hero walk's loader: downloads and decodes the frames, and decides which, in what order.

   It runs in a Web Worker (hero-walk.worker.ts), so neither the download bookkeeping nor the
   decoding ever runs on the page's main thread (Safari decodes on the thread that asks). Where a
   worker can't start, the player runs this same class on the page instead, with the same messages.

   What stays decoded is a plan, rebuilt whenever the scroll moves:
   1. The frames on screen now.
   2. Frames on the predicted path to where the scroll is heading (exact with smooth scroll, from
      the speed otherwise). A fast flick passes several positions per screen refresh, so the
      frames are spaced by how far one refresh moves there, divided by how many frames this
      device decodes per refresh (measured): a fast laptop gets every 2nd or 4th position, a slow
      phone about one per refresh, never every position the flick passes. Frames the scroll will
      pass before a decode could finish are skipped. The player cross-fades across the gaps. The
      spacing is a power of two on a fixed grid, so the points don't shift as the scroll moves
      and a frame decoded a moment ago is still one the path needs.
   3. The frames around where it will stop, then around the position, ahead first.
   Decoded frames go to the player (transferred, not copied). When there's no room, frames outside
   the plan are released: those off the path first (passed, or the other way), then the farthest.

   Downloads: the plan's frames first, in their own "urgent" slots at high priority, so they never
   wait behind the background fill. The fill runs in coarse-to-fine passes (every 32nd file, then
   16th, 8th, 4th, 2nd, then the rest), nearest the position first, ahead before behind, so a
   visitor who scrolls early already has the whole walk in coarse steps (shown as cross-fades),
   and it sharpens as they go. Nothing is downloaded while the walk is far from the screen. */

export type LoaderConfig = {
  base: string;
  variant: string;
  ext: "avif" | "webp";
  /** manifest.frames: the file shown at each scroll position. */
  frames: string[];
  /** Decoded frames kept at most. */
  budget: number;
  /** Decodes at once. */
  decoders: number;
  fetchBackground: number;
  fetchUrgent: number;
  retries: number;
};

export type ToLoader =
  | ({ type: "init" } & LoaderConfig)
  /** pos: the position on screen; dest: where the scroll is heading (both fractional positions);
      speed: positions per second now; smooth: dest is smooth scroll's own target (exact). */
  | { type: "focus"; pos: number; dest: number; dir: 1 | -1; speed: number; smooth: boolean }
  | { type: "active"; on: boolean }
  | { type: "destroy" };

export type FromLoader = { type: "frame"; file: number; bitmap: ImageBitmap } | { type: "evict"; files: number[] };

type Post = (msg: FromLoader, transfer?: Transferable[]) => void;

/** Screen refreshes per second the predicted path is sampled at. */
const REFRESH_HZ = 60;
/** Time constant of the predicted approach to the destination (smooth scroll plus glide), seconds. */
const PATH_TAU = 0.25;
/** The background fill's coarse-to-fine passes, as steps between files. */
const PASSES = [32, 16, 8, 4, 2, 1];
/** Pause before a file that failed every attempt is tried again, ms. */
const RETRY_PAUSE = 5000;

/** Holds store a file once and repeat it in the frame list: the unique files, the file at each
    position, and each file's first and last position. Files are in scroll order. */
export function indexFrames(frames: string[]) {
  const files: string[] = [];
  const first: number[] = [];
  const last: number[] = [];
  const index = new Map<string, number>();
  const fileAt = frames.map((name, p) => {
    let f = index.get(name);
    if (f === undefined) {
      f = files.length;
      index.set(name, f);
      files.push(name);
      first.push(p);
    }
    last[f] = p;
    return f;
  });
  return { files, fileAt, first, last };
}

export class WalkLoader {
  private post: Post;
  private cfg: LoaderConfig | null = null;
  private destroyed = false;
  private active = true;
  private aborter = new AbortController();
  private ext: "avif" | "webp" = "avif";

  private files: string[] = [];
  private fileAt: number[] = [];
  private first: number[] = [];
  private last: number[] = [];
  private pass: number[] = [];

  private blobs: (Blob | undefined)[] = [];
  private requested: boolean[] = [];
  private retryAt: number[] = [];
  private loaded = 0;
  private urgentInFlight = 0;
  private backgroundInFlight = 0;

  private decoding = new Set<number>();
  /** Files decoded and handed to the player, not yet released. */
  private held = new Set<number>();
  private decoded = 0;
  private decodeFailures = 0;
  /** Running average of one decode, in ms: a cautious guess until measured. */
  private decodeMs = 25;

  private focus = { pos: 0, dest: 0, dir: 1 as 1 | -1, speed: 0, smooth: false };
  private plan: number[] = [];
  private planned = new Set<number>();

  constructor(post: Post) {
    this.post = post;
  }

  handle(msg: ToLoader) {
    if (this.destroyed) return;
    switch (msg.type) {
      case "init": {
        const cfg: LoaderConfig = msg;
        this.cfg = cfg;
        this.ext = cfg.ext;
        const { files, fileAt, first, last } = indexFrames(cfg.frames);
        this.files = files;
        this.fileAt = fileAt;
        this.first = first;
        this.last = last;
        const lastFile = files.length - 1;
        this.pass = files.map((_, f) => (f === 0 || f === lastFile ? 0 : PASSES.findIndex((s) => f % s === 0)));
        break;
      }
      case "focus":
        this.focus = { pos: msg.pos, dest: msg.dest, dir: msg.dir, speed: Math.abs(msg.speed), smooth: msg.smooth };
        break;
      case "active":
        if (this.active === msg.on) return;
        this.active = msg.on;
        // Far from the screen: give the memory back. The canvas keeps its last picture.
        if (!msg.on && this.held.size) {
          this.post({ type: "evict", files: [...this.held] });
          this.held.clear();
        }
        break;
      case "destroy":
        this.destroyed = true;
        this.aborter.abort();
        this.blobs = [];
        return;
    }
    this.replan();
  }

  /* ── The plan ───────────────────────────────────────────────────── */

  private replan() {
    if (!this.cfg) return;
    this.plan = this.active ? this.buildPlan(this.cfg) : [];
    this.planned = new Set(this.plan);
    this.pump();
  }

  private buildPlan(cfg: LoaderConfig): number[] {
    const n = this.fileAt.length;
    const cap = cfg.budget;
    const out: number[] = [];
    const seen = new Set<number>();
    const add = (p: number) => {
      if (out.length >= cap || p < -0.5 || p > n - 0.5) return;
      const f = this.fileAt[Math.min(n - 1, Math.max(0, Math.round(p)))];
      if (seen.has(f)) return;
      seen.add(f);
      out.push(f);
    };
    const { pos, dest, dir, speed, smooth } = this.focus;
    const dist = dest - pos;
    // Positions moved per screen refresh, now. Smooth scroll eases out to its target, so the first
    // refresh of a flick already moves its share of the distance, before the measured speed catches up.
    const q = Math.exp(-1 / (REFRESH_HZ * PATH_TAU));
    const perRefresh = Math.max(speed / REFRESH_HZ, smooth ? Math.abs(dist) * (1 - q) : 0);
    // Fast: the next refresh alone moves more than one position.
    const fast = perRefresh > 1;

    // 1. On screen now (the two frames the player may be cross-fading). While flying past, they
    //    come after the path: by the time they'd be decoded, the scroll is elsewhere.
    if (!fast) {
      add(Math.floor(pos));
      add(Math.ceil(pos));
    }

    // 2. The path. Each point is spaced by how far one screen refresh moves there (times how many
    //    refreshes one decode takes on this device, if more than one), rounded down to a power of
    //    two, on a fixed grid of multiples of that spacing. The grid doesn't shift as the scroll
    //    moves, so frames decoded a moment ago are still the right ones.
    if (Math.abs(dist) >= 1) {
      const sign = dist > 0 ? 1 : -1;
      const refreshMs = 1000 / REFRESH_HZ;
      // Frames this device decodes per refresh (measured), of which the path may use 70%.
      const share = Math.max(0.25, ((cfg.decoders * refreshMs) / this.decodeMs) * 0.7);
      // Skip what the scroll will have passed before a decode could land (whole refreshes only).
      const lead = Math.floor(this.decodeMs / refreshMs);
      let p = fast ? pos + sign * Math.min(Math.abs(dist) - 1, perRefresh * lead) : pos;
      for (let guard = 0; out.length < cap && guard < 1024; guard++) {
        const remaining = Math.abs(dest - p);
        if (remaining < 0.5) break;
        // What one refresh moves here (the scroll slows as it nears dest), over what can be decoded.
        const spacing = Math.min(32, Math.max(1, (perRefresh * remaining) / Math.abs(dist) / share));
        const stride = 2 ** Math.floor(Math.log2(spacing));
        const next = sign > 0 ? (Math.floor(p / stride) + 1) * stride : (Math.ceil(p / stride) - 1) * stride;
        if (sign > 0 ? next > dest + 0.5 : next < dest - 0.5) break;
        p = next;
        add(p);
      }
      // Where it will stop.
      for (let k = 0; k <= 3; k++) {
        add(dest + dir * k);
        if (k) add(dest - dir * k);
      }
    }
    if (fast) {
      add(Math.floor(pos));
      add(Math.ceil(pos));
    }

    // 3. Around the position, ahead first (behind at half the reach), for small moves, pauses and
    //    turning back.
    for (let k = 1; out.length < cap; k++) {
      const ahead = pos + dir * k;
      const behind = pos - (dir * k) / 2;
      if ((ahead < 0 || ahead > n - 1) && (behind < 0 || behind > n - 1)) break;
      add(ahead);
      if (k % 2 === 0) add(behind);
    }
    return out;
  }

  /* ── Work ───────────────────────────────────────────────────────── */

  private pump = () => {
    const cfg = this.cfg;
    if (!cfg || this.destroyed) return;
    // Decode first: frames already downloaded are the quickest win.
    for (const f of this.plan) {
      if (this.decoding.size >= cfg.decoders) break;
      if (this.blobs[f] && !this.held.has(f) && !this.decoding.has(f)) void this.decode(f);
    }
    // Downloads the plan needs, in their own slots.
    for (const f of this.plan) {
      if (this.urgentInFlight >= cfg.fetchUrgent) break;
      if (this.fetchable(f)) void this.download(f, true);
    }
    // The background fill.
    while (this.active && this.backgroundInFlight < cfg.fetchBackground) {
      const f = this.nextBackground();
      if (f < 0) break;
      void this.download(f, false);
    }
  };

  private fetchable(f: number) {
    return !this.requested[f] && !this.blobs[f] && !(this.retryAt[f] > performance.now());
  }

  /** The coarsest pass first; within it, nearest the position, ahead counting double. */
  private nextBackground(): number {
    if (this.loaded + this.urgentInFlight + this.backgroundInFlight >= this.files.length) return -1;
    const n = this.fileAt.length;
    const here = this.fileAt[Math.min(n - 1, Math.max(0, Math.round(this.focus.pos)))];
    let best = -1;
    let bestScore = Infinity;
    for (let f = 0; f < this.files.length; f++) {
      if (!this.fetchable(f)) continue;
      const d = f - here;
      const score = this.pass[f] * 1e6 + (Math.sign(d) === this.focus.dir ? Math.abs(d) : 2 * Math.abs(d));
      if (score < bestScore) {
        bestScore = score;
        best = f;
      }
    }
    return best;
  }

  private async download(f: number, urgent: boolean) {
    this.requested[f] = true;
    if (urgent) this.urgentInFlight++;
    else this.backgroundInFlight++;
    const ext = this.ext;
    const blob = await this.fetchFile(f, ext, urgent);
    if (urgent) this.urgentInFlight--;
    else this.backgroundInFlight--;
    if (this.destroyed || ext !== this.ext) return void this.pump();
    if (blob) {
      this.blobs[f] = blob;
      this.loaded++;
    } else {
      // Every attempt failed: leave it for a few seconds, so a dead file doesn't hog a slot.
      this.requested[f] = false;
      this.retryAt[f] = performance.now() + RETRY_PAUSE;
      setTimeout(this.pump, RETRY_PAUSE);
    }
    this.pump();
  }

  private async fetchFile(f: number, ext: string, urgent: boolean): Promise<Blob | null> {
    const cfg = this.cfg!;
    const url = `${cfg.base}/${cfg.variant}/${ext}/${this.files[f]}.${ext}`;
    const init: RequestInit & { priority?: "high" | "low" | "auto" } = { signal: this.aborter.signal, priority: urgent ? "high" : "low" };
    for (let attempt = 1; attempt <= cfg.retries; attempt++) {
      try {
        const res = await fetch(url, init);
        if (res.ok) return await res.blob();
      } catch {
        if (this.destroyed) return null;
      }
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
    return null;
  }

  /** Full size: decoding straight to a smaller size measured 2–3× slower in Chrome. */
  private async decode(f: number) {
    const blob = this.blobs[f]!;
    const ext = this.ext;
    this.decoding.add(f);
    const t0 = performance.now();
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(blob);
    } catch {
      // handled below
    }
    this.decoding.delete(f);
    if (this.destroyed || ext !== this.ext) return bitmap?.close();
    if (!bitmap) {
      this.decodeFailed(f);
      return this.pump();
    }
    this.decoded++;
    this.decodeMs += (performance.now() - t0 - this.decodeMs) * 0.25;
    if (!this.active || (!this.planned.has(f) && this.pathDistance(f) > 0)) {
      // Passed by already, or no longer wanted.
      bitmap.close();
    } else {
      this.makeRoom();
      this.held.add(f);
      this.post({ type: "frame", file: f, bitmap }, [bitmap]);
    }
    this.pump();
  }

  private decodeFailed(f: number) {
    this.decodeFailures++;
    if (this.ext === "avif" && this.decoded === 0 && this.decodeFailures >= 2) {
      // AVIF passed the probe but won't decode here: use WebP from now on.
      this.ext = "webp";
      this.blobs = [];
      this.requested = [];
      this.retryAt = [];
      this.loaded = 0;
      return;
    }
    // A damaged download: fetch it again later.
    this.blobs[f] = undefined;
    this.loaded--;
    this.requested[f] = false;
    this.retryAt[f] = performance.now() + RETRY_PAUSE;
    setTimeout(this.pump, RETRY_PAUSE);
  }

  /** How far a file lies outside the stretch between the position and where the scroll is heading
      (0 inside it), in positions. */
  private pathDistance(f: number) {
    const { pos, dest } = this.focus;
    const lo = Math.min(pos, dest) - 2;
    const hi = Math.max(pos, dest) + 2;
    return this.last[f] < lo ? lo - this.last[f] : this.first[f] > hi ? this.first[f] - hi : 0;
  }

  /** Release decoded frames outside the plan until one more fits: those farthest off the path
      first (already passed, or the other way), then the farthest from the position. */
  private makeRoom() {
    const budget = this.cfg!.budget;
    if (this.held.size < budget) return;
    const pos = this.focus.pos;
    const released: number[] = [];
    while (this.held.size >= budget) {
      let victim = -1;
      let worst = -1;
      for (const h of this.held) {
        if (this.planned.has(h)) continue;
        const score = this.pathDistance(h) * 1000 + Math.abs(this.first[h] - pos);
        if (score > worst) {
          worst = score;
          victim = h;
        }
      }
      if (victim < 0) break;
      this.held.delete(victim);
      released.push(victim);
    }
    if (released.length) this.post({ type: "evict", files: released });
  }
}
