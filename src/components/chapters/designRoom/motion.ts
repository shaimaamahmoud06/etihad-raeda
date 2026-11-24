"use client";

import { duration, ease } from "@/design/motion";
import { gsap } from "@/motion/engine";

/* The slats lift away one after another, revealing the room panel by panel.
   At lg, one gold line grows across the steps and each number brightens as it arrives. */
export function designRoomMotion(section: HTMLElement) {
  const photo = section.querySelector<HTMLElement>("[data-design-photo]");
  const slats = section.querySelectorAll<HTMLElement>("[data-slat]");
  if (photo && slats.length) {
    gsap.fromTo(
      slats,
      { scaleY: 1 },
      { scaleY: 0, duration: duration.curtain, ease: ease.curtain, stagger: 0.14, scrollTrigger: { trigger: photo, start: "top 82%", once: true } },
    );
  }

  const steps = section.querySelector<HTMLElement>("[data-steps]");
  const line = section.querySelector<HTMLElement>("[data-steps-line]");
  const nums = section.querySelectorAll<HTMLElement>("[data-step-num]");
  if (!steps || !line) return;
  // Desktop only: the line is hidden below lg, and --num-o only applies from lg (see globals.css),
  // so this never needs rebuilding when the screen crosses the breakpoint.
  const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: steps, start: "top 80%", end: "top 35%", scrub: 1 } });
  tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
  nums.forEach((n, i) => tl.fromTo(n, { "--num-o": 0.2 }, { "--num-o": 1, duration: 0.1 }, i * 0.225));
}
