"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "@/i18n/navigation";
import { effects, lenis as lenisConfig } from "@/design/motion";
import { gsap, ScrollTrigger } from "@/motion/engine";
import { getLenis, setLenis } from "@/motion/lenis-store";

/* Smooth scrolling for mouse-wheel only; touch devices scroll natively (§6.2).
   Off with reduced motion, ?motion=reduce, or the effect switch. Driven by GSAP's ticker. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    if (!effects.smoothScroll || document.documentElement.classList.contains("force-reduce")) return;

    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | null = null;
    const tick = (time: number) => instance?.raf(time * 1000);

    const start = () => {
      if (instance) return;
      instance = new Lenis({ duration: lenisConfig.duration, easing: lenisConfig.easing, anchors: lenisConfig.anchors });
      instance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);
    };
    const stop = () => {
      if (!instance) return;
      gsap.ticker.remove(tick);
      instance.destroy();
      instance = null;
      setLenis(null);
    };
    const sync = () => (mq.matches ? stop() : start());
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  // On every route change, jump to the top immediately.
  useEffect(() => {
    const l = getLenis();
    if (l) l.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
