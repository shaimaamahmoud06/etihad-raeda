import { brand } from "@/content/global";
import type { Locale } from "@/content/types";
import { Monogram } from "@/components/ui/Monogram";
import { IntroDone } from "./IntroDone";

/* The opening animation, homepage only, pure CSS (§6.3). Plays once per browser session.
   Hidden when already seen, with ?motion=reduce, and under reduced motion. */
export function Intro({ locale }: { locale: Locale }) {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-curtain" data-side="start" />
      <div className="intro-curtain" data-side="end" />
      <div className="intro-mark">
        <span className="block size-24 sm:size-28">
          <Monogram size="100%" strokeWidth={2} />
        </span>
        {locale === "ar" ? (
          <span className="intro-name font-display text-[1.6rem] leading-tight">{brand.short.ar}</span>
        ) : (
          <span className="intro-name font-lockup text-[0.95rem] font-normal uppercase tracking-[0.42em]">{brand.short.en}</span>
        )}
        <span className="intro-seal eyebrow text-gold">{brand.seal[locale]}</span>
      </div>
      <IntroDone />
    </div>
  );
}
