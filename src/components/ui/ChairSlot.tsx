"use client";

import { useEffect, useRef, useState } from "react";

/* The 3D-chair film (§16): pre-rendered, transparent, not a live model.
   .mov (HEVC with alpha) for Safari and every iPhone browser, .webm (VP9 with alpha) for the rest.
   The Full cut is used, not the Zoom cut: the Zoom's ending crops to a narrow strip of fabric
   at the frame's edge, so the section read as empty on every screen. The Full cut keeps the
   whole chair in frame through the half turn (the tag close-up is the trade-off).
   It plays when it scrolls into view, muted and inline, and replays each time it re-enters;
   pausing when it leaves keeps it from finishing unseen.
   Reduced motion and Save-Data get a still of the chair. */

const SRC = "/chair/chair-full";

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
          v.currentTime = 0;
          v.play().catch(() => {});
        } else {
          v.pause();
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
