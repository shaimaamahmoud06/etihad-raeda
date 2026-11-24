"use client";

import type Lenis from "lenis";

/* The one Lenis instance, so the menu can pause it and route changes can jump to the top. */
let current: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  current = l;
};
export const getLenis = () => current;
