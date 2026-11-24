"use client";

import { useEffect, useRef, useState } from "react";

/* The 3D-chair film (§16): pre-rendered, transparent, not a live model.
   .mov (HEVC with alpha) for Safari and every iPhone browser, .webm (VP9 with alpha) for the rest.
   One cut for every screen: the half turn, then the push in to the "Made in Italy" tag, which ends
   at the frame's right edge (the layout sets that edge flush with the screen's).
   It plays once when it scrolls into view, muted and inline, and stays on its last frame.
   Reduced motion and Save-Data get a still of that last frame. */

const SRC = "/chair/chair-zoom";

export function ChairSlot({ label, className = "" }: { label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const still =
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("force-reduce") ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (still) return;
    const id = requestAnimationFrame(() => setMotion(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !motion) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.play().catch(() => {});
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [motion]);

  return (
    <div className={`relative aspect-[4/5] w-full ${className}`} role="img" aria-label={label}>
      {motion ? (
        <video ref={ref} className="absolute inset-0 h-full w-full object-contain" muted playsInline preload="auto" poster={`${SRC}-poster.png`} aria-hidden="true">
          <source src={`${SRC}.mov`} type='video/quicktime; codecs="hvc1"' />
          <source src={`${SRC}.webm`} type='video/webm; codecs="vp9"' />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${SRC}-end.png`} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
      )}
    </div>
  );
}
