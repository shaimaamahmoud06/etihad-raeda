"use client";

import { scene } from "@/design/motion";
import { gsap, pageLocale } from "@/motion/engine";
import { twoDigit } from "@/lib/format";
import { penPath, penSize } from "@/content/plans/executive-suite";

/* Pinned for 4.2 screen heights; everything is scrubbed and runs backwards on scroll up.
   0–1.6 Survey · 1.6–2.8 The shell · 2.8–4.4 Layout · 4.4–5.6 Dimensions, then a 0.35 hold. */
const STEP_START = [0, 1.6, 2.8, 4.4];
const STEP_END = [1.6, 2.8, 4.4, 5.6];
const END = 5.6;

export function drawingMotion(section: HTMLElement) {
  const stage = section.querySelector<HTMLElement>("[data-plan-stage]");
  const svg = section.querySelector<SVGSVGElement>("[data-plan]");
  if (!stage || !svg) return;
  const q = <T extends Element = SVGElement>(sel: string, root: ParentNode = svg) => Array.from(root.querySelectorAll<T>(sel));
  const locale = pageLocale();

  const outer = q("[data-plan-wall=outer]");
  const inner = q("[data-plan-wall=inner]");
  const walls = [...outer, ...inner];
  const details = q("[data-plan-detail]");
  const rooms = q("[data-plan-room]");
  const hatch = svg.querySelector("[data-plan-hatch]");
  const dimLines = q("[data-plan-dimline]");
  const labels = q("[data-plan-label]");
  const figs = q("[data-plan-fig]");
  const markers = q("[data-plan-marker]");
  const pen = svg.querySelector("[data-plan-pen]");
  const notes = q<HTMLElement>("[data-plan-note]", section);
  const steps = q<HTMLElement>("[data-plan-steps] > li", section);
  const current = section.querySelector<HTMLElement>("[data-plan-current]");
  const progress = section.querySelector<HTMLElement>("[data-plan-progress]");
  const finalCurrent = current?.textContent ?? "";

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: stage,
      pin: true,
      anticipatePin: 1,
      scrub: 1.2,
      start: "top top",
      end: () => `+=${window.innerHeight * scene.drawing}`,
      invalidateOnRefresh: true,
    },
  });

  // Start states.
  gsap.set([...walls, ...details, ...dimLines, ...q("[data-plan-room] path")], { strokeDashoffset: 1 });
  gsap.set(walls, { fillOpacity: 0 });
  gsap.set([...labels, ...figs, ...notes], { opacity: 0 });
  if (hatch) gsap.set(hatch, { opacity: 0 });
  gsap.set(markers, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
  gsap.set(steps.slice(1), { opacity: 0 });

  // Throughout: progress bar, step counter, caption cross-fades.
  if (progress) tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: END, ease: "none" }, 0);
  for (let k = 1; k < steps.length; k++) {
    const s = STEP_START[k];
    tl.to(steps[k - 1], { opacity: 0, y: -12, duration: 0.22 }, s - 0.2);
    tl.fromTo(steps[k], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, s);
  }
  let shown = -1;
  tl.eventCallback("onUpdate", () => {
    const t = tl.time();
    const k = t < STEP_START[1] ? 0 : t < STEP_START[2] ? 1 : t < STEP_START[3] ? 2 : 3;
    if (k !== shown && current) {
      shown = k;
      current.textContent = twoDigit(k + 1, locale);
    }
  });

  // The pen: fades in, travels through each step's points with even time per point, fades out.
  if (pen) {
    const half = penSize / 2;
    tl.fromTo(pen, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0);
    penPath.forEach((pts, k) => {
      const dt = (STEP_END[k] - STEP_START[k]) / pts.length;
      pts.forEach(([x, y], i) => tl.to(pen, { attr: { x: x - half, y: y - half }, duration: dt }, STEP_START[k] + i * dt));
    });
    tl.to(pen, { opacity: 0, duration: 0.15 }, END - 0.15);
  }

  // 0–1.6 Survey: wall outlines draw, outside walls first.
  tl.to(walls, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut", stagger: { amount: 0.85 } }, 0);

  // 1.6–2.8 The shell: walls fill; windows, doors, arcs, lift and steps draw.
  tl.to(walls, { fillOpacity: 1, duration: 0.5, stagger: 0.012 }, 1.6);
  tl.to(details, { strokeDashoffset: 0, duration: 0.45, stagger: { amount: 0.6 } }, 1.95);

  // 2.8–4.4 Layout: furniture room by room; the travertine hatch fades in.
  rooms.forEach((room, i) => {
    tl.to(q("path", room), { strokeDashoffset: 0, duration: 0.5, stagger: { amount: 0.35 } }, 2.85 + i * 0.26);
  });
  if (hatch) tl.to(hatch, { opacity: 0.4, duration: 0.4 }, 3.05);

  // 4.4–5.6 Dimensions.
  tl.to(dimLines, { strokeDashoffset: 0, duration: 0.5, stagger: 0.02 }, 4.45);
  labels.forEach((el, i) => tl.to(el, { opacity: Number(el.getAttribute("opacity") ?? 1), duration: 0.3 }, 4.6 + i * 0.05));
  tl.to(figs, { opacity: 0.6, duration: 0.3, stagger: 0.03 }, 4.75);
  tl.to(markers, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out", stagger: 0.22 }, 4.8);
  tl.to(notes, { opacity: 1, duration: 0.3, stagger: 0.22 }, 4.85);

  tl.to({}, { duration: 0.35 }, END);

  return () => {
    if (current) current.textContent = finalCurrent;
  };
}
