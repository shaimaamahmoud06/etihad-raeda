import { designRoom } from "@/content/pages/home";
import { twoDigit } from "@/lib/format";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SplitWords } from "@/components/ui/SplitWords";
import type { ChapterProps } from "../registry";

/* Ch.7 We design the room. The photo is revealed panel by panel; four steps follow. */
export function DesignRoom({ locale }: ChapterProps) {
  const d = designRoom;
  return (
    <div className="chapter-pad">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <h2 id="ch-designRoom-title" className="display t-h1 lg:col-span-5">
            <SplitWords text={d.line1[locale]} className="block text-fg/55" />
            <SplitWords text={d.line2[locale]} className="block" />
          </h2>
          <div className="relative lg:col-span-7" data-design-photo="">
            <PhotoSlot name={d.photo} locale={locale} curtain={false} parallax className="aspect-[4/3]" sizes="(min-width: 1024px) 58vw, 100vw" />
            <div aria-hidden="true" className="slats pointer-events-none absolute inset-0 grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} data-slat="" className="block origin-top bg-bg" />
              ))}
            </div>
          </div>
        </div>

        <div data-steps="" className="relative mt-20 lg:mt-28">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 hidden h-px bg-fg/15 lg:block" />
          <div aria-hidden="true" data-steps-line="" className="absolute inset-x-0 top-0 hidden h-px origin-left bg-gold lg:block [[dir=rtl]_&]:origin-right" />
          <ol className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {d.steps.map((s, i) => (
            <li key={i} data-reveal="" className="relative pt-8">
              <div data-rule="" aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gold lg:hidden" />
              <p data-step-num="" className="display num text-[2.75rem] leading-none text-gold">
                {twoDigit(i + 1, locale)}
              </p>
              <h3 className="display t-h3 mt-5">{s.title[locale]}</h3>
              <p className="mt-3 max-w-[30ch] text-fg/75">{s.text[locale]}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
