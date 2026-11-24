"use client";

import { gsap } from "@/motion/engine";

/* The re-scale: the suite's walls draw in and it recedes; the small office opens out from
   its centre and settles; the headline rises in. Scrubbed across the tall scene. */
export function broadeningMotion(section: HTMLElement) {
  const scene = section.querySelector<HTMLElement>("[data-bro-scene]");
  const from = section.querySelector<HTMLElement>("[data-bro-from]");
  const to = section.querySelector<HTMLElement>("[data-bro-to]");
  const text = section.querySelector<HTMLElement>("[data-bro-text]");
  if (!scene || !from || !to) return;
  const fromImg = from.querySelector("[data-photo-media]");
  const toImg = to.querySelector("[data-photo-media]");

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: 1 },
  });
  tl.fromTo(from, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(9% 16% 9% 16%)", duration: 0.7, ease: "power1.inOut" }, 0);
  if (fromImg) tl.fromTo(fromImg, { scale: 1.08 }, { scale: 0.96, duration: 0.9 }, 0);
  tl.fromTo(from, { opacity: 1 }, { opacity: 0.2, duration: 0.5 }, 0.35);
  tl.fromTo(to, { clipPath: "inset(30% 34% 30% 34%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "power2.inOut" }, 0.2);
  if (toImg) tl.fromTo(toImg, { scale: 1.3 }, { scale: 1, duration: 0.8 }, 0.2);
  if (text) tl.fromTo(text, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, 0.8);
}
