import { timeline } from "@/content/pages/home";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SplitWords } from "@/components/ui/SplitWords";
import type { ChapterProps } from "../registry";

/* Ch.5 Six decades. With motion the stage pins and the track slides in the reading direction.
   Still version: a native sideways scroller with snap, focusable, labelled by the heading. */
export function Timeline({ locale }: ChapterProps) {
  const t = timeline;
  return (
    <div data-tl-stage="" className="flex min-h-svh flex-col justify-center gap-12 overflow-hidden pb-14 pt-[calc(var(--header-h)+2rem)] lg:gap-16">
      <div className="shell grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
        <p data-reveal="" className="eyebrow text-gold lg:col-span-3">
          {t.eyebrow[locale]}
        </p>
        <SplitWords as="h2" id="ch-timeline-title" text={t.headline[locale]} className="display t-h2 max-w-[22ch] lg:col-span-9" />
      </div>

      <div data-tl-scroller="" role="region" tabIndex={0} aria-labelledby="ch-timeline-title" className="tl-scroller">
        <ol data-tl-track="" className="flex w-max items-stretch gap-6 px-[var(--gutter)] lg:gap-12">
          {t.milestones.map((m, i) => {
            const pending = Boolean(m.year.pending || m.text.pending);
            return (
              <li key={i} className="tl-panel flex w-[min(80vw,24rem)] shrink-0 flex-col border-s border-fg/15 ps-6 lg:w-[clamp(20rem,28vw,27rem)] lg:ps-10">
                <p
                  data-tl-year=""
                  className={`display num leading-none ${
                    m.year.pending ? "pending text-[clamp(1.5rem,2.4vw,2.2rem)]" : "text-[clamp(3.25rem,6.5vw,6rem)] text-gold"
                  }`}
                >
                  {m.year[locale]}
                </p>
                <p className={`t-lead mt-8 max-w-[22ch] text-fg/85 ${m.text.pending ? "pending" : ""}`}>{m.text[locale]}</p>
                {pending && (
                  <div className="mt-auto pt-8">
                    <span className="pending-tag text-oak">{t.pendingTag[locale]}</span>
                  </div>
                )}
              </li>
            );
          })}
          <li className="tl-panel w-[min(86vw,40rem)] shrink-0 lg:w-[clamp(32rem,46vw,46rem)]">
            <PhotoSlot name={t.endPhoto} locale={locale} curtain={false} className="aspect-[16/10]" sizes="(min-width: 1024px) 46vw, 86vw" />
          </li>
        </ol>
      </div>

      <div className="shell tl-progress" aria-hidden="true">
        <div className="relative h-px bg-fg/15">
          <div data-tl-fill="" className="absolute inset-0 origin-left bg-gold [[dir=rtl]_&]:origin-right" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
