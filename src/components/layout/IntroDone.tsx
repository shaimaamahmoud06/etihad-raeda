"use client";

import { useEffect } from "react";
import { intro } from "@/design/motion";

/** After the intro has played, mark it finished so returning to the homepage doesn't replay it. */
export function IntroDone() {
  useEffect(() => {
    const id = window.setTimeout(() => document.documentElement.classList.add("intro-finished"), (intro.hold + 1.6) * 1000);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
