"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import type { Tone } from "@/content/types";
import type { ChapterName } from "@/content/pages/home";
import { applyPresets, colourHandOff, depthExit, gsap, markMotionReady, scheduleRefresh } from "@/motion/engine";
import { chapterMotions } from "./motions";

/* The section wrapper for every homepage chapter (§5.3): tone, colour hand-off,
   the chapter's own choreography, shared presets, depth exit, one batched refresh.
   Server markup is always the final visible state; motion only adds the journey. */

type Props = {
  name: ChapterName;
  tone: Tone;
  prevTone?: Tone;
  labelledBy: string;
  depth: boolean;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

export function ChapterShell({ name, tone, prevTone, labelledBy, depth, className = "", innerClassName = "", children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section || document.documentElement.classList.contains("force-reduce")) return;
      const mm = gsap.matchMedia();
      // Built once per reduced-motion state; never rebuilt on resize (ScrollTrigger re-measures instead).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        markMotionReady();
        colourHandOff(section, tone, prevTone);
        // The chapter's own choreography first (some chapters pin themselves).
        const own = chapterMotions[name]?.(section);
        const revertPresets = applyPresets(section);
        if (depth) depthExit(section);
        scheduleRefresh();
        return () => {
          revertPresets();
          if (typeof own === "function") own();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className={`chapter ${className}`}
      data-chapter={name}
      data-tone={tone}
      data-prev-tone={prevTone}
      aria-labelledby={labelledBy}
    >
      <div data-chapter-inner="" className={innerClassName}>
        {children}
      </div>
    </section>
  );
}
