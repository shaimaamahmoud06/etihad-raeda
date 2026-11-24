"use client";

import { distance, duration, ease, stagger } from "@/design/motion";
import { gsap, ScrollTrigger } from "@/motion/engine";

/* Names rise in as their rows arrive. Proximity: as the cursor nears a row, a gold hairline
   draws under it from the reading start and the name warms to gold and gains weight.
   On touch devices the highlight travels down the ledger with the scroll instead. */
export function registerMotion(section: HTMLElement) {
  const list = section.querySelector<HTMLElement>("[data-register-list]");
  if (!list) return;
  const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-register-row]"));
  const names = rows.map((r) => r.querySelector<HTMLElement>("[data-register-name]")!);

  gsap.set(names, { y: `${distance.wordRise}em` });
  ScrollTrigger.batch(names, {
    start: "top 92%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: duration.reveal, ease: ease.reveal, stagger: stagger.items / 2, overwrite: true }),
  });

  const setters = rows.map((row) => gsap.quickTo(row, "--p", { duration: 0.6, ease: "power2.out" }));
  const setP = (i: number, p: number) => {
    setters[i](p);
    rows[i].classList.toggle("is-near", p > 0.5);
  };

  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    const reach = 110;
    const onMove = (e: PointerEvent) => {
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect();
        const d = Math.abs(e.clientY - (r.top + r.height / 2));
        setP(i, Math.max(0, 1 - d / reach));
      });
    };
    const onLeave = () => rows.forEach((_, i) => setP(i, 0));
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    return () => {
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
      rows.forEach((r) => r.classList.remove("is-near"));
    };
  }

  // Touch: a slow wave that follows the scroll (no loop).
  const wave = { pos: -1 };
  gsap.to(wave, {
    pos: rows.length,
    ease: "none",
    scrollTrigger: { trigger: list, start: "top 75%", end: "bottom 35%", scrub: 1.5 },
    onUpdate: () => rows.forEach((_, i) => setP(i, Math.max(0, 1 - Math.abs(i - wave.pos) / 1.6))),
  });
  return () => rows.forEach((r) => r.classList.remove("is-near"));
}
