import { drawing } from "@/content/pages/home";
import { twoDigit } from "@/lib/format";
import type { ChapterProps } from "../registry";
import { Plan } from "./Plan";

/* Ch.8 The drawing: a floor plan that draws itself. Not from the copy deck; all its
   wording needs the copywriter's review. */

function Crosshair({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className={`absolute size-[0.7rem] text-fg/50 ${className}`} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M6 0v12M0 6h12" />
    </svg>
  );
}

export function Drawing({ locale }: ChapterProps) {
  const d = drawing;
  const total = d.steps.length;
  return (
    <div data-plan-stage="" className="flex min-h-svh items-center pb-6 pt-[calc(var(--header-h)+1.25rem)] sm:pb-10">
      <div className="shell grid w-full gap-y-5 sm:gap-y-8 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-4 lg:row-start-1 lg:self-end">
          <p className="eyebrow text-accent">{d.eyebrow[locale]}</p>
          <h2 id="ch-drawing-title" data-reveal="" className="display t-h2 mt-5 max-w-[16ch]">
            {d.headline[locale]}
          </h2>
          <p data-reveal="" className="mt-6 hidden text-fg/75 sm:block">
            {d.intro[locale]}
          </p>
        </div>

        <figure className="plan-sheet relative border border-fg/14 px-3 pb-3 pt-7 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1">
          <div aria-hidden="true" className="plan-ruler absolute inset-x-3 top-2 h-3" />
          <Crosshair className="start-1 top-1" />
          <Crosshair className="end-1 top-1" />
          <Plan locale={locale} label={d.planLabel[locale]} />
          <figcaption className="mt-4 grid gap-3">
            <ol className="flex flex-wrap gap-x-6 gap-y-2">
              {d.legend.map((note, i) => (
                <li key={i} data-plan-note="" className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="label num grid size-5 shrink-0 place-items-center bg-gold text-[0.62rem] text-ink">
                    {twoDigit(i + 1, locale)}
                  </span>
                  <span className="text-[0.8rem] text-fg/75">{note[locale]}</span>
                </li>
              ))}
            </ol>
            <p className="text-[0.72rem] text-fg/50">{d.smallPrint[locale]}</p>
          </figcaption>
        </figure>

        <div data-plan-panel="" className="w-full max-w-[26rem] self-start border border-fg/14 lg:col-span-4 lg:row-start-2 lg:mt-10">
          <div className="label flex items-center gap-4 bg-fg px-4 py-2.5 text-[0.72rem] tracking-[0.18em] text-bg">
            <span className="num whitespace-nowrap">
              <span data-plan-current="">{twoDigit(total, locale)}</span> <span className="opacity-55">/ {twoDigit(total, locale)}</span>
            </span>
            <span className="relative h-px flex-1 bg-bg/25" aria-hidden="true">
              <span data-plan-progress="" className="absolute inset-0 origin-left bg-gold [[dir=rtl]_&]:origin-right" />
            </span>
          </div>
          <ol data-plan-steps="" className="plan-steps grid gap-[0.9rem] p-[0.9rem]">
            {d.steps.map((s, i) => (
              <li key={i}>
                <p className="label text-[0.72rem] uppercase tracking-[0.18em] text-accent">
                  <span className="num">{twoDigit(i + 1, locale)}</span> · {s.title[locale]}
                </p>
                <p className="mt-1 text-[0.95rem] text-fg/80">{s.text[locale]}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
