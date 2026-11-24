import { Link } from "@/i18n/navigation";
import { selectedWork, type Shape } from "@/content/pages/home";
import { twoDigit } from "@/lib/format";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SplitWords } from "@/components/ui/SplitWords";
import { Arrow } from "@/components/ui/Arrow";
import type { ChapterProps } from "../registry";

/* Ch.4 Selected work: an asymmetric, staggered gallery that follows item order. */

const shapeClass: Record<Shape, string> = {
  landscape: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  tall: "aspect-[4/5]",
  panorama: "aspect-[4/3] md:aspect-[21/9]",
};

/** Placement by position: md two columns (1 and 5 full width, 3 pushed down); lg twelve columns. */
const placeClass = [
  "md:col-span-2 lg:col-span-7 lg:col-start-1",
  "lg:col-span-4 lg:col-start-9 lg:mt-40",
  "md:mt-24 lg:col-span-5 lg:col-start-2 lg:mt-0",
  "lg:col-span-4 lg:col-start-8 lg:mt-24",
  "md:col-span-2 lg:col-span-10 lg:col-start-3",
];

export function SelectedWork({ locale }: ChapterProps) {
  const w = selectedWork;
  return (
    <div className="chapter-pad">
      <div className="shell">
        <div className="flex items-end justify-between gap-8">
          <SplitWords as="h2" id="ch-selectedWork-title" text={w.headline[locale]} className="display t-h2" />
          <Link href={w.allLink.href} data-reveal="" className="link-line hidden shrink-0 sm:inline-flex">
            {w.allLink.label[locale]}
            <Arrow />
          </Link>
        </div>
        <div data-rule="" aria-hidden="true" className="mt-8 h-px bg-fg/15" />

        <ul className="mt-16 grid gap-y-[4.5rem] md:grid-cols-2 md:gap-x-6 md:gap-y-20 lg:mt-24 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-28">
          {w.items.map((item, i) => {
            const [title, detail] = item.caption[locale].split(" — ");
            return (
              <li key={i} className={placeClass[i] ?? "lg:col-span-6"}>
                <Link href={item.href} className="group block">
                  <PhotoSlot
                    name={item.photo}
                    locale={locale}
                    parallax
                    className={shapeClass[item.shape]}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                  />
                  <div data-reveal="" className="mt-5">
                    <span className="label num text-[0.68rem] text-accent">{twoDigit(i + 1, locale)}</span>
                    <h3 className="display t-h3 mt-2 transition-colors duration-700 group-hover:text-accent">
                      {title}
                      <span className="ms-3 inline-block align-middle opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                        <Arrow />
                      </span>
                    </h3>
                    {detail && <p className="mt-2 max-w-[28rem] text-fg/70">{detail}</p>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href={w.allLink.href} className="link-line mt-16 sm:hidden">
          {w.allLink.label[locale]}
          <Arrow />
        </Link>
      </div>
    </div>
  );
}
