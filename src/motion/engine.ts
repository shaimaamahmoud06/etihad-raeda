"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { distance, duration, ease, effects, stagger, trigger } from "@/design/motion";
import type { Locale } from "@/content/types";
import { formatNumber } from "@/lib/format";

/* Shared motion: presets opted into with data attributes, the colour hand-off,
   the depth exit and the batched refresh scheduler (§5.3–5.4). */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger };

export const isRTL = () => document.documentElement.dir === "rtl";
export const pageLocale = (): Locale => (document.documentElement.lang === "ar" ? "ar" : "en");

/** Motion runs only without reduced motion and without ?motion=reduce. */
export const motionAllowed = () =>
  !document.documentElement.classList.contains("force-reduce") && matchMedia("(prefers-reduced-motion: no-preference)").matches;

/** Mark motion as ready, so the safety timer leaves the hidden states alone. */
export function markMotionReady() {
  document.documentElement.classList.add("js-motion", "motion-ready");
}

let refreshQueued = false;
/** One batched ScrollTrigger.refresh() on the next animation frame. */
export function scheduleRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

const within = (scope: Element, sel: string) => Array.from(scope.querySelectorAll<HTMLElement>(sel));

/* ── Colour hand-off (§4.2) ─────────────────────────────────────────── */
export function colourHandOff(section: HTMLElement, tone: string, prevTone?: string) {
  if (!effects.colourHandOff || !prevTone || prevTone === tone) return;
  gsap.set(section, { "--t": 0, "--tf": 0 });
  const st = { trigger: section, start: "top 96%", end: "top 30%", scrub: true };
  gsap.to(section, { "--t": 1, ease: "none", scrollTrigger: st });
  gsap.to(section, { "--tf": 1, ease: "expo.inOut", scrollTrigger: { ...st } });
}

/* ── Depth exit ─────────────────────────────────────────────────────── */
export function depthExit(section: HTMLElement) {
  if (!effects.depthExit) return;
  const inner = section.querySelector<HTMLElement>("[data-chapter-inner]");
  if (!inner) return;
  gsap.to(inner, {
    y: () => -window.innerHeight * distance.depthLift,
    opacity: 0.55,
    ease: "none",
    scrollTrigger: { trigger: section, start: "bottom 70%", end: "bottom top", scrub: true, invalidateOnRefresh: true },
  });
}

/* ── Shared presets ─────────────────────────────────────────────────── */

export function revealBatch(scope: Element) {
  const blocks = within(scope, '[data-reveal=""]');
  if (!blocks.length) return;
  gsap.set(blocks, { y: distance.blockRise });
  ScrollTrigger.batch(blocks, {
    start: trigger.block,
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: duration.reveal, ease: ease.reveal, stagger: stagger.items, overwrite: true }),
  });
}

export function wordsIn(el: Element, opts: { delay?: number; scrollTrigger?: boolean } = {}) {
  const words = within(el, "[data-word]");
  return gsap.fromTo(
    words,
    { opacity: 0, y: `${distance.wordRise}em` },
    {
      opacity: 1,
      y: 0,
      duration: duration.word,
      ease: ease.reveal,
      stagger: stagger.words,
      delay: opts.delay ?? 0,
      scrollTrigger: opts.scrollTrigger === false ? undefined : { trigger: el, start: trigger.word, once: true },
    },
  );
}

export function curtain(frame: HTMLElement) {
  const media = frame.querySelector<HTMLElement>("[data-photo-media] > *") ?? frame.querySelector<HTMLElement>("[data-photo-media]");
  const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: trigger.word, once: true } });
  tl.fromTo(frame, { clipPath: "inset(0 50% 0 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: duration.curtain, ease: ease.curtain });
  if (media) tl.fromTo(media, { scale: 1.18 }, { scale: 1, duration: duration.settle, ease: ease.settle }, 0);
  return tl;
}

export function parallax(frame: HTMLElement) {
  if (!effects.photoParallax) return;
  const media = frame.querySelector<HTMLElement>("[data-photo-media]");
  if (!media) return;
  const p = distance.parallax * 100;
  gsap.fromTo(
    media,
    { yPercent: -p },
    { yPercent: p, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } },
  );
}

export function drawStrokes(svg: Element, opts: { scrollTrigger?: boolean; delay?: number } = {}) {
  const paths = within(svg, "path");
  return gsap.fromTo(
    paths,
    { strokeDashoffset: 1 },
    {
      strokeDashoffset: 0,
      duration: duration.draw,
      ease: ease.draw,
      stagger: stagger.strokes,
      delay: opts.delay ?? 0,
      scrollTrigger: opts.scrollTrigger === false ? undefined : { trigger: svg, start: trigger.word, once: true },
    },
  );
}

export function rule(el: HTMLElement) {
  gsap.fromTo(
    el,
    { scaleX: 0 },
    { scaleX: 1, duration: duration.draw, ease: ease.reveal, scrollTrigger: { trigger: el, start: trigger.block, once: true } },
  );
}

/** Count from 0 to the target once, formatted in the page language. Reverts to the final number. */
export function countUp(el: HTMLElement, opts: { scrollTrigger?: boolean; delay?: number } = {}) {
  const target = Number(el.dataset.count);
  const locale = pageLocale();
  const final = el.textContent;
  const state = { n: 0 };
  el.textContent = formatNumber(0, locale);
  const tween = gsap.to(state, {
    n: target,
    duration: duration.count,
    ease: ease.settle,
    delay: opts.delay ?? 0,
    onUpdate: () => {
      el.textContent = formatNumber(state.n, locale);
    },
    scrollTrigger: opts.scrollTrigger === false ? undefined : { trigger: el, start: trigger.word, once: true },
  });
  return { tween, revert: () => (el.textContent = final) };
}

export function drift(scope: HTMLElement, section: HTMLElement) {
  const rtl = isRTL();
  for (const el of within(scope, "[data-drift-x], [data-drift-y]")) {
    const x = Number(el.dataset.driftX ?? 0) * (rtl ? -1 : 1);
    const y = Number(el.dataset.driftY ?? 0);
    gsap.fromTo(
      el,
      { x: -x / 2, yPercent: -y / 2 },
      { x: x / 2, yPercent: y / 2, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } },
    );
  }
}

/** Apply every opt-in preset inside a chapter. Returns cleanup for counters. */
export function applyPresets(section: HTMLElement): () => void {
  const reverts: (() => void)[] = [];
  revealBatch(section);
  for (const el of within(section, '[data-words=""]')) wordsIn(el);
  for (const el of within(section, "[data-curtain]")) curtain(el);
  for (const el of within(section, "[data-parallax]")) parallax(el);
  for (const el of within(section, "[data-draw]")) drawStrokes(el);
  for (const el of within(section, '[data-rule=""]')) rule(el);
  for (const el of within(section, "[data-count]:not([data-count-manual])")) reverts.push(countUp(el).revert);
  drift(section, section);
  return () => reverts.forEach((r) => r());
}
