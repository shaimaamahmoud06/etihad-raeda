import type { ComponentType } from "react";
import type { ChapterName } from "@/content/pages/home";
import type { Locale } from "@/content/types";
import { Hero } from "./hero/Hero";
import { Register } from "./register/Register";
import { AuditBureau } from "./auditBureau/AuditBureau";
import { SelectedWork } from "./selectedWork/SelectedWork";
import { Timeline } from "./timeline/Timeline";
import { Craft } from "./craft/Craft";
import { DesignRoom } from "./designRoom/DesignRoom";
import { Drawing } from "./drawing/Drawing";
import { Broadening } from "./broadening/Broadening";
import { Showroom } from "./showroom/Showroom";
import { Closing } from "./closing/Closing";

/* name → component, depth exit and section classes. Depth exit is off for pinned or sticky
   chapters (a transformed ancestor breaks pinning), and for the hero and the closing. */

export type ChapterProps = { locale: Locale; pageUrl: string };

type Entry = { Component: ComponentType<ChapterProps>; depth: boolean; className?: string };

export const registry: Record<ChapterName, Entry> = {
  hero: { Component: Hero, depth: false },
  register: { Component: Register, depth: true },
  auditBureau: { Component: AuditBureau, depth: false },
  selectedWork: { Component: SelectedWork, depth: true },
  timeline: { Component: Timeline, depth: false },
  craft: { Component: Craft, depth: true },
  designRoom: { Component: DesignRoom, depth: true },
  drawing: { Component: Drawing, depth: false },
  broadening: { Component: Broadening, depth: false },
  showroom: { Component: Showroom, depth: true },
  closing: { Component: Closing, depth: false },
};
