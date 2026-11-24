import type { L } from "../types";

/* Holding pages for sections built in later phases, so the menu never leads nowhere,
   and the 404. Not in copy deck v1: these lines need the copywriter's review. */

/** The slugs that get a holding page. The page name comes from the header menu. */
export const holdingSlugs = ["projects", "institutions", "heritage", "your-office", "showroom"] as const;

export const holding = {
  lead: { ar: "هذه الصفحة تُبنى في المرحلة التالية.", en: "This page is built in the next phase." } as L,
  back: { ar: "العودة إلى الرئيسية", en: "Back to the homepage" } as L,
};

export const notFound = {
  title: { ar: "لم نجد هذه الصفحة.", en: "We couldn't find that page." } as L,
};
