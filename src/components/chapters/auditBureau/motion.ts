"use client";

import { scene } from "@/design/motion";
import { countUp, gsap, pageLocale } from "@/motion/engine";
import { formatNumber, twoDigit } from "@/lib/format";

/* Pinned for 2.8 screen heights. Floors appear as outlines, a scan line climbs and lights
   them one by one while the counter climbs; the four lines rise one per step. */
export function auditMotion(section: HTMLElement) {
  const stage = section.querySelector<HTMLElement>("[data-audit-stage]");
  if (!stage) return;
  const lines = Array.from(stage.querySelectorAll<HTMLElement>("[data-audit-line]"));
  const close = stage.querySelector<HTMLElement>("[data-audit-close]");
  const floors = Array.from(stage.querySelectorAll<HTMLElement>("[data-floor]"));
  const floorsBox = stage.querySelector<HTMLElement>("[data-floors]");
  const scan = stage.querySelector<HTMLElement>("[data-scan]");
  const counter = stage.querySelector<HTMLElement>("[data-floor-count]");
  const number = stage.querySelector<HTMLElement>("[data-count]");
  const locale = pageLocale();
  const finalCounter = counter?.textContent ?? "";
  const lit = "color-mix(in srgb, var(--c-gold) 78%, transparent)";

  const finalNumber = number?.textContent ?? "";
  let counted = false;
  if (number) number.textContent = formatNumber(0, locale);

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: stage,
      pin: true,
      anticipatePin: 1,
      scrub: 1,
      start: "top top",
      end: () => `+=${window.innerHeight * scene.auditBureau}`,
      invalidateOnRefresh: true,
    },
  });

  // 0: floors appear as outlines, ground first; line 1 rises in.
  tl.fromTo(floors, { opacity: 0, scaleX: 0.6, backgroundColor: "transparent" }, { opacity: 1, scaleX: 1, duration: 0.25, stagger: 0.03 }, 0);
  tl.fromTo(lines[0], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 0);

  // 0.55: the scan line appears; 0.6: it climbs and lights each floor; the counter climbs.
  if (scan && floorsBox) {
    tl.to(scan, { opacity: 1, duration: 0.05 }, 0.55);
    tl.fromTo(scan, { y: 0 }, { y: () => -floorsBox.offsetHeight, duration: 2.9, ease: "none" }, 0.6);
    tl.to(scan, { opacity: 0, duration: 0.2 }, 3.5);
  }
  floors.forEach((f, i) => tl.to(f, { backgroundColor: lit, duration: 0.2 }, 0.6 + i * 0.27));
  if (counter) {
    const c = { n: 0 };
    tl.fromTo(
      c,
      { n: 0 },
      {
        n: floors.length,
        duration: 2.9,
        ease: "none",
        onUpdate: () => (counter.textContent = twoDigit(Math.round(c.n), locale)),
      },
      0.6,
    );
  }

  // 1, 2, 3: lines 2–4 rise one per step; earlier lines step back to 30%.
  for (let k = 1; k < lines.length; k++) {
    tl.fromTo(lines[k], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, k);
    tl.to(lines.slice(0, k), { opacity: 0.3, duration: 0.4 }, k);
  }

  // 2.05: 12,500 counts up once, on a clock (not scrubbed, no replay).
  tl.call(
    () => {
      if (counted || !number) return;
      counted = true;
      countUp(number, { scrollTrigger: false });
    },
    undefined,
    2.05,
  );

  // 3.6: all lines back to full strength; 3.7: the closing block rises in; then a hold.
  tl.to(lines, { opacity: 1, duration: 0.4 }, 3.6);
  if (close) tl.fromTo(close, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 3.7);
  tl.to({}, { duration: 0.5 });

  return () => {
    if (counter) counter.textContent = finalCounter;
    if (number) number.textContent = finalNumber;
  };
}
