import { address, labels } from "@/content/global";
import { showroom } from "@/content/pages/home";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SplitWords } from "@/components/ui/SplitWords";
import { Arrow } from "@/components/ui/Arrow";
import type { ChapterProps } from "../registry";

/* Ch.10 Showroom. No third-party map embed until the pin is confirmed. */
export function Showroom({ locale }: ChapterProps) {
  const s = showroom;
  return (
    <div className="chapter-pad">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-8">
        <PhotoSlot
          name={s.photo}
          locale={locale}
          parallax
          className="aspect-[4/5] sm:aspect-[4/3] lg:col-span-7 lg:aspect-[5/6]"
          sizes="(min-width: 1024px) 58vw, 100vw"
        />
        <div className="lg:col-span-4 lg:col-start-9">
          <SplitWords as="h2" id="ch-showroom-title" text={s.headline[locale]} className="display t-hero" />
          <p data-reveal="" className="t-lead mt-8 text-fg/75">
            {s.body[locale]}
          </p>
          <ul data-reveal="" className="mt-10 border-t border-fg/15">
            {s.details.map((d, i) => (
              <li key={i} className="border-b border-fg/15 py-4">
                <span className={d.pending ? "pending" : ""}>{d[locale]}</span>
              </li>
            ))}
          </ul>
          <div data-reveal="">
            <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-solid mt-10">
              {s.directions[locale]}
              <Arrow />
              <span className="sr-only">{labels.newTab[locale]}</span>
            </a>
          </div>
          <div data-reveal="" role="img" aria-label={s.mapTag[locale]} className="map-frame relative mt-10 aspect-[16/7] border border-fg/15">
            <span aria-hidden="true" className="absolute left-[58%] top-[42%] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_8px_color-mix(in_srgb,var(--accent)_15%,transparent)]" />
            <span aria-hidden="true" className="pending-tag absolute bottom-3 start-3 text-accent">
              {s.mapTag[locale]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
