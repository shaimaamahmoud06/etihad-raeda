"use client";

import { gsap, isRTL } from "@/motion/engine";

/* Pinned for exactly as long as the track needs to travel (recomputed on resize).
   The track slides leftwards in English, rightwards in Arabic; years drift ±36 px against it. */
export function timelineMotion(section: HTMLElement) {
  const stage = section.querySelector<HTMLElement>("[data-tl-stage]");
  const scroller = section.querySelector<HTMLElement>("[data-tl-scroller]");
  const track = section.querySelector<HTMLElement>("[data-tl-track]");
  const fill = section.querySelector<HTMLElement>("[data-tl-fill]");
  if (!stage || !scroller || !track) return;
  const years = section.querySelectorAll<HTMLElement>("[data-tl-year]");
  const dir = isRTL() ? 1 : -1;
  const travel = () => Math.max(0, track.scrollWidth - scroller.clientWidth);

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: stage,
      pin: true,
      anticipatePin: 1,
      scrub: 1,
      start: "top top",
      end: () => `+=${travel()}`,
      invalidateOnRefresh: true,
    },
  });
  tl.fromTo(track, { x: 0 }, { x: () => dir * travel() }, 0);
  tl.fromTo(years, { x: 36 * dir }, { x: -36 * dir }, 0);
  if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1 }, 0);
}
