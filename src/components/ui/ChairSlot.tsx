"use client";

import { useEffect, useRef, useState } from "react";

/* The 3D-chair film (§16): pre-rendered, transparent, not a live model.
   .mov (HEVC with alpha) for Safari and every iPhone browser, .webm (VP9 with alpha) for the rest.
   The Zoom cut is used, as she chose: the half turn, then the camera pushes in on the small
   dark "MADE IN ITALY" tag. The ending crops close on the tag, so only part of the chair is in
   view at the last frame — that is the look she wants.
   It plays when it scrolls into view, muted and inline, and replays each time it re-enters;
   pausing when it leaves keeps it from finishing unseen.
   Reduced motion and Save-Data get a still of the chair.

   Loading: nothing (not even the poster) is fetched until the chair is about a screen and a half
   away, so it never competes with the hero walk on first load. When it comes into view it plays
   as soon as enough is buffered to run without stalling; iPhones don't buffer muted video ahead
   of play, so after a short wait it plays anyway. */

const SRC = "/chair/chair-zoom";
/** Start loading when the chair is this close to the screen. */
const NEAR = "150% 0px";
/** How long to wait for a full buffer before playing anyway (iPhones never report one early). */
const BUFFER_WAIT_MS = 1200;

export function ChairSlot({ label, className = "" }: { label: string; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [motion, setMotion] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const still =
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("force-reduce") ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (still) return;
    const id = requestAnimationFrame(() => setMotion(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Mount the video (and its poster) only once the chair is near the screen.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !motion) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: NEAR },
    );
    io.observe(box);
    return () => io.disconnect();
  }, [motion]);

  // Play from the start each time it comes into view, once buffered; pause when it leaves.
  useEffect(() => {
    const v = ref.current;
    if (!v || !near) return;
    let inView = false;
    let timer = 0;
    const start = () => {
      window.clearTimeout(timer);
      v.removeEventListener("canplaythrough", start);
      if (!inView) return;
      v.currentTime = 0;
      v.play().catch(() => {});
    };
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) {
          if (v.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) return start();
          v.addEventListener("canplaythrough", start);
          timer = window.setTimeout(start, BUFFER_WAIT_MS);
        } else {
          window.clearTimeout(timer);
          v.removeEventListener("canplaythrough", start);
          v.pause();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      v.removeEventListener("canplaythrough", start);
    };
  }, [near]);

  return (
    <div ref={boxRef} className={`relative aspect-[4/5] w-full ${className}`} role="img" aria-label={label}>
      {motion ? (
        near && (
          <video ref={ref} className="absolute inset-0 h-full w-full object-contain" muted playsInline preload="auto" poster={`${SRC}-poster.png`} aria-hidden="true">
            <source src={`${SRC}.mov`} type='video/quicktime; codecs="hvc1"' />
            <source src={`${SRC}.webm`} type='video/webm; codecs="vp9"' />
          </video>
        )
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${SRC}-end.png`} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
      )}
    </div>
  );
}
