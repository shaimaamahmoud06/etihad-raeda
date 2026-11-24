"use client";

import { intro } from "@/design/motion";

/** Seconds the hero should wait so its entrance starts when the curtains are half open.
    Measured from the curtains' own running CSS animation. */
export function introDelay(): number {
  const d = document.documentElement;
  if (d.classList.contains("intro-seen")) return intro.minDelay;
  const curtain = document.querySelector<HTMLElement>(".intro-curtain");
  const anim = curtain?.getAnimations?.()[0];
  if (!anim || anim.currentTime == null) return intro.minDelay;
  const elapsed = Number(anim.currentTime) / 1000;
  return Math.max(intro.minDelay, intro.hold + intro.heroOffset - elapsed);
}

/** The inline script that runs in <head> before anything is painted (§5.2). */
export const HEAD_SCRIPT = `(function(){var d=document.documentElement;
try{if(sessionStorage.getItem('er-intro'))d.classList.add('intro-seen');else sessionStorage.setItem('er-intro','1');}catch(e){}
if(/[?&]motion=reduce(&|$)/.test(location.search)){d.classList.add('force-reduce');d.classList.remove('js-motion');return;}
var mq=window.matchMedia('(prefers-reduced-motion: no-preference)');
var sync=function(){d.classList.toggle('js-motion',mq.matches);};
sync();if(mq.addEventListener)mq.addEventListener('change',sync);
setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('js-motion');},${intro.safetyMs});
})();`;
