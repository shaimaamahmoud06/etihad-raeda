import { Link } from "@/i18n/navigation";
import { broadening } from "@/content/pages/home";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ChairSlot } from "@/components/ui/ChairSlot";
import { Arrow } from "@/components/ui/Arrow";
import type { ChapterProps } from "../registry";
import { scene } from "@/design/motion";

/* Ch.9 For your office: the B2C bridge. The institutional room re-scales into a small office.
   The institution extending its standard, not a second brand. No prices. */
export function Broadening({ locale, pageUrl }: ChapterProps) {
  const b = broadening;
  return (
    <>
      <div data-bro-scene="" className="bro-scene relative" style={{ "--bro-scene": scene.broadening } as React.CSSProperties}>
        <div data-bro-stage="" data-tone="ink-deep" className="bro-stage h-svh overflow-hidden">
          <PhotoSlot name={b.from} locale={locale} curtain={false} labelPos="top-start" className="!absolute inset-0" frameProps={{ "data-bro-from": "" }} />
          <PhotoSlot name={b.to} locale={locale} curtain={false} labelPos="top-end" className="!absolute inset-0" frameProps={{ "data-bro-to": "" }} />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgb(8 22 39 / .88), rgb(8 22 39 / .25) 55%, transparent 80%)" }}
          />
          <div data-bro-text="" className="absolute inset-x-0 bottom-0 pb-[clamp(3rem,9vh,6rem)]">
            <div className="shell">
              <p className="eyebrow text-gold">{b.eyebrow[locale]}</p>
              <h2 id="ch-broadening-title" className="display t-h1 mt-5 max-w-[20ch]">
                {b.headline[locale]}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="chapter-pad">
        {/* The chair sits on the physical right in both languages, flush with the screen's edge,
            so the film's last frame (the tag at the frame's right edge) meets the edge of the screen.
            The text keeps to the page column on the left. */}
        <div className="chair-row flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-10 rtl:lg:flex-row-reverse">
          <div className="chair-text min-w-0 px-[var(--gutter)] lg:flex-1 lg:pr-0 lg:pl-[max(var(--gutter),calc((100%_-_var(--shell-max))_/_2_+_var(--gutter)))]">
            <div className="max-w-[36rem]">
              <h3 data-reveal="" className="display t-h3">
                {b.chair.headline[locale]}
              </h3>
              <p data-reveal="" className="t-lead mt-6 text-fg/80">
                {b.body[locale]}
              </p>
              <div data-reveal="">
                <Link href={b.link.href} className="link-line mt-8">
                  {b.link.label[locale]}
                  <Arrow />
                </Link>
              </div>
            </div>
          </div>
          <figure className="ml-auto w-[88%] max-w-[30rem] shrink-0 sm:w-[60%] lg:w-[40%] lg:max-w-[38rem]">
            <ChairSlot label={b.chair.label[locale]} />
            <figcaption className="mt-3 pr-[var(--gutter)] text-right text-[0.72rem] text-fg/55">{b.chair.label[locale]}</figcaption>
          </figure>
        </div>

        <div className="shell">
          <ul className="mt-20 grid gap-14 md:grid-cols-3 md:gap-6 lg:mt-28 lg:gap-8">
            {b.collections.map((c, i) => (
              <li key={c.code} className={i === 1 ? "md:mt-16" : ""}>
                <PhotoSlot name={c.photo} locale={locale} parallax className="aspect-[4/5]" sizes="(min-width: 768px) 33vw, 100vw" />
                <div data-reveal="" className="mt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="display t-h3">{c.name[locale]}</h3>
                    <span className="ltr label shrink-0 text-[0.68rem] tracking-[0.14em] text-accent">{c.code}</span>
                  </div>
                  <p className="mt-2 text-fg/70">{c.line[locale]}</p>
                  <WhatsAppButton
                    locale={locale}
                    label={b.whatsappLabel[locale]}
                    pageUrl={pageUrl}
                    item={{ name: c.waName[locale], code: c.code, collection: c.name.en }}
                    placement="home-broadening"
                    className="mt-6 w-full"
                  />
                </div>
              </li>
            ))}
          </ul>
          <p data-reveal="" className="mt-12 text-[0.9rem] text-fg/70">
            {b.note[locale]}
          </p>
        </div>
      </div>
    </>
  );
}
