import { craft } from "@/content/pages/home";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SplitWords } from "@/components/ui/SplitWords";
import type { ChapterProps } from "../registry";

/* Ch.6 Materials & craft. Four close-ups in a slow, counter-moving mosaic. */
export function Craft({ locale }: ChapterProps) {
  const c = craft;
  return (
    <div className="chapter-pad">
      <div className="shell">
        <h2 id="ch-craft-title" className="display t-h1 max-w-[20ch]">
          <SplitWords text={c.line1[locale]} className="block" />
          <SplitWords text={c.line2[locale]} className="block text-accent [:root[lang=en]_&]:italic" />
        </h2>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
          <p data-reveal="" className="t-lead text-fg/75 lg:col-span-5 lg:col-start-8">
            {c.body[locale]}
          </p>
        </div>

        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:mt-24 lg:grid-cols-4 lg:gap-8">
          {c.materials.map((m, i) => (
            <li key={m.photo} className={i % 2 === 1 ? "mt-14 lg:mt-28" : ""} data-drift-y={i % 2 === 0 ? 8 : -14}>
              <PhotoSlot name={m.photo} locale={locale} className="aspect-[3/4]" sizes="(min-width: 1024px) 25vw, 50vw" />
              <p data-reveal="" className="display mt-5 text-[1.75rem] leading-tight [:root[lang=ar]_&]:text-[1.4rem]">
                {m.label[locale]}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
