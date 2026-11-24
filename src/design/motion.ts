/* Global motion settings (§5.1). [EDITABLE]
   House style: slow, weighty, long gentle endings, no bounce. Plays once. Nothing loops. */

/** Multiplies every duration and stagger: 1.3 is 30% slower, 0.8 is faster. */
export const SPEED = 1;

export const effects = {
  colourHandOff: true,
  depthExit: true,
  photoParallax: true,
  smoothScroll: true,
  headerAutoHide: true,
};

export const ease = {
  reveal: "power3.out",
  settle: "power2.out",
  curtain: "power4.out",
  draw: "power2.inOut",
};

const s = (n: number) => n * SPEED;

export const duration = {
  reveal: s(1.25),
  word: s(1.3),
  curtain: s(1.4),
  settle: s(2),
  draw: s(1.4),
  count: s(2.8),
  pushIn: s(9),
};

export const stagger = {
  words: s(0.075),
  items: s(0.12),
  strokes: s(0.16),
};

export const distance = {
  /** px */
  blockRise: 28,
  /** em */
  wordRise: 0.4,
  /** fraction of the photo's height, each way */
  parallax: 0.07,
  /** fraction of the screen height */
  depthLift: 0.04,
};

export const trigger = {
  block: "top 88%",
  word: "top 86%",
};

export const lenis = {
  duration: 1.25,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  anchors: true,
};

/** Scroll scene lengths, in multiples of the screen height. */
export const scene = {
  /** The hero walk: a tall section holding a sticky one-screen stage. The walk itself is scrolled
      over (heroWalk - 1) screens: 4.5. (Was 7.5 — a short scroll then showed no change, so the
      walk read as stuck on every phone.) */
  heroWalk: 5.5,
  auditBureau: 2.8,
  drawing: 4.2,
  broadening: 2.6,
};

/** Intro timing in seconds; keep in step with --intro-* in tokens.css. */
export const intro = {
  hold: 2.35,
  open: 1.2,
  /** The hero waits for the curtains to be half open. */
  heroOffset: 0.35,
  minDelay: 0.15,
  /** The safety timer that shows everything if motion never starts. */
  safetyMs: 8000,
};

/** The hero walk player (§16, web/hero/README.md). */
export const walk = {
  /** Eased glide toward the scroll position, as a time constant in ms. */
  glideMs: 90,
  /** Downloads in flight at once, and attempts per frame. */
  concurrency: 6,
  retries: 3,
  /** Frames kept decoded around the position, in the scroll direction. */
  decodeAhead: 14,
  decodeBehind: 5,
  /** Decoded frames kept at most before the farthest are released. */
  decodedBudget: 32,
  /** Pixel ratio cap for the canvas. */
  maxDpr: 2,
};
