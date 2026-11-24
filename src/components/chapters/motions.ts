"use client";

import type { ChapterName } from "@/content/pages/home";
import { heroMotion } from "./hero/motion";
import { registerMotion } from "./register/motion";
import { auditMotion } from "./auditBureau/motion";
import { timelineMotion } from "./timeline/motion";
import { designRoomMotion } from "./designRoom/motion";
import { drawingMotion } from "./drawing/motion";
import { broadeningMotion } from "./broadening/motion";

/** name → its own choreography (run before the shared presets). May return a cleanup.
    Chapters without an entry use the shared presets only. */
export type ChapterMotion = (section: HTMLElement) => void | (() => void);

export const chapterMotions: Partial<Record<ChapterName, ChapterMotion>> = {
  hero: heroMotion,
  register: registerMotion,
  auditBureau: auditMotion,
  timeline: timelineMotion,
  designRoom: designRoomMotion,
  drawing: drawingMotion,
  broadening: broadeningMotion,
};
