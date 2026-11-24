"use client";

import { duration, ease, stagger, distance } from "@/design/motion";
import { hero } from "@/content/pages/home";
import { gsap, scheduleRefresh } from "@/motion/engine";
import { introDelay } from "@/motion/intro";
import { WalkPlayer, variantFor } from "@/motion/hero-walk";
import { walk as walkCfg } from "@/design/motion";

/* Hero entrance after the intro, then the walk: the scroll through the tall scene drives the
   frame player and one scrubbed timeline for the overlays (give-way, room labels, end card). */
export function heroMotion(section: HTMLElement) {
  const delay = introDelay();
  const words = section.querySelectorAll("[data-word]");
  const rule = section.querySelector("[data-hero-rule]");
  const fades = section.querySelectorAll("[data-hero-fade]");

  const wordsEnd = duration.word + stagger.words * (words.length - 1);
  const tl = gsap.timeline({ delay });
  tl.fromTo(words, { opacity: 0, y: `${distance.wordRise}em` }, { opacity: 1, y: 0, duration: duration.word, ease: ease.reveal, stagger: stagger.words });
  const ruleAt = Math.max(0, wordsEnd - 0.7);
  tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: duration.draw, ease: ease.draw }, ruleAt);
  tl.fromTo(
    fades,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: duration.reveal, ease: ease.reveal, stagger: stagger.items },
    Math.max(0, ruleAt + duration.draw - 1.1),
  );

  const scene = section.querySelector<HTMLElement>("[data-hero-scene]");
  const canvas = section.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
  if (!scene || !canvas) return;

  // Save-Data gets the poster only, in a one-screen hero.
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) {
    scene.dataset.walk = "off";
    scheduleRefresh();
    return () => delete scene.dataset.walk;
  }

  const w = hero.walk;
  let progress = 0;
  let near = true;
  const makePlayer = () => {
    const p = new WalkPlayer(canvas, {
      base: w.base,
      variant: variantFor(),
      onFirstFrame: () => gsap.to(canvas, { opacity: 1, duration: 0.6, ease: "power2.out" }),
    });
    p.setProgress(progress, true);
    p.setActive(near);
    p.start();
    return p;
  };
  let player = makePlayer();

  // Frames load only while the walk is on or near the screen, so once a visitor has scrolled on,
  // the rest of the page (the chair film, the photos) gets the bandwidth.
  const nearObs = new IntersectionObserver(
    ([e]) => {
      near = e.isIntersecting;
      player.setActive(near);
    },
    { rootMargin: walkCfg.nearMargin },
  );
  nearObs.observe(scene);

  // Turning a phone or resizing across portrait/landscape swaps the frame set.
  const orientation = matchMedia("(orientation: portrait)");
  const onOrientation = () => {
    player.destroy();
    gsap.set(canvas, { opacity: 0 });
    player = makePlayer();
  };
  orientation.addEventListener("change", onOrientation);

  const walk = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progress = self.progress;
        player.setProgress(progress);
      },
    },
  });
  walk.to({}, { duration: 1 }, 0);

  // The headline and buttons give way over the first 10% of the walk.
  walk.to(section.querySelectorAll("[data-hero-giveway]"), { opacity: 0, yPercent: -6, duration: w.giveWay }, 0);

  // The navy wash: full strength only for the first frames of the first building, then it fades.
  walk.fromTo(section.querySelector("[data-hero-scrim]"), { opacity: 1 }, { opacity: 0, duration: w.scrimFadedBy - w.scrimFullUntil }, w.scrimFullUntil);

  // One line per building after the first: in as the walk enters the room, out before it leaves.
  const lines = Array.from(section.querySelectorAll<HTMLElement>("[data-hero-line]"));
  w.lines.forEach((l, i) => {
    const el = lines[i];
    if (!el) return;
    walk.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.03, ease: "power2.out" }, l.from);
    walk.to(el, { opacity: 0, y: -18, duration: 0.03, ease: "power2.in" }, l.to - 0.03);
  });

  // Room labels change as the walk enters each room, then leave before the end card.
  const rooms = Array.from(section.querySelectorAll<HTMLElement>("[data-hero-room]"));
  const fade = 0.02;
  w.rooms.forEach((r, i) => {
    if (i === 0 || !rooms[i]) return;
    walk.to(rooms[i - 1], { opacity: 0, duration: fade }, r.from - fade / 2);
    walk.fromTo(rooms[i], { opacity: 0 }, { opacity: 1, duration: fade }, r.from - fade / 2);
  });
  if (rooms.length) walk.to(rooms[rooms.length - 1], { opacity: 0, duration: fade }, w.labelsOut);

  // From 92%: the end line and the button on the clear end wall.
  const end = section.querySelector<HTMLElement>("[data-hero-end]");
  if (end) walk.fromTo(end, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.04, ease: "power2.out" }, w.endFrom);

  return () => {
    orientation.removeEventListener("change", onOrientation);
    nearObs.disconnect();
    player.destroy();
  };
}
