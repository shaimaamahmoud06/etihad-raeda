import { Link } from "@/i18n/navigation";
import { hero } from "@/content/pages/home";
import { labels } from "@/content/global";
import type { Locale } from "@/content/types";
import { scene } from "@/design/motion";
import { SplitWords } from "@/components/ui/SplitWords";
import { Arrow } from "@/components/ui/Arrow";

/* Ch.1 Hero ("Overture"): a scroll-scrubbed walk through three rooms they furnished, rebuilt in 3D.
   The poster (first frame) is the first paint and the still version; the canvas plays the walk
   over it. Authority in one line; the year does the work. */
export function Hero({ locale }: { locale: Locale }) {
  const w = hero.walk;
  const first = (variant: "desktop" | "phone", ext: "avif" | "webp") => `${w.base}/${variant}/${ext}/0001.${ext}`;

  return (
    <div data-hero-scene="" className="hero-scene relative" style={{ "--hero-scene": scene.heroWalk } as React.CSSProperties}>
      <div data-hero-stage="" className="hero-stage flex h-svh flex-col justify-end overflow-hidden bg-ink-deep pb-[clamp(3.5rem,10vh,7rem)] pt-[calc(var(--header-h)+4rem)]">
        <picture>
          <source media="(orientation: portrait)" type="image/avif" srcSet={first("phone", "avif")} />
          <source media="(orientation: portrait)" type="image/webp" srcSet={first("phone", "webp")} />
          <source type="image/avif" srcSet={first("desktop", "avif")} />
          <img src={first("desktop", "webp")} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        </picture>
        <canvas data-hero-canvas="" aria-hidden="true" className="hero-canvas absolute inset-0 h-full w-full" />
        <p className="sr-only">{w.srText[locale]}</p>

        {/* A light navy strip along the bottom for the small print and the room lines, always on. */}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgb(8_22_39/.5)_0%,rgb(8_22_39/.2)_26%,transparent_46%)]" />
        {/* The full wash (top for the header, deeper navy behind the opening headline). With motion it
            stays only for the first frames of the first building, then fades so the rooms are seen. */}
        <div aria-hidden="true" data-hero-scrim="" className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[32%] bg-[linear-gradient(to_bottom,rgb(8_22_39/.78),transparent)]" />
          <div className="hero-scrim absolute inset-0" />
        </div>

        <div aria-hidden="true" className="hero-rooms absolute end-[var(--gutter)] top-[calc(var(--header-h)+1.25rem)] grid justify-items-end">
          {w.rooms.map((r, i) => (
            <p key={i} data-hero-room="" className="eyebrow col-start-1 row-start-1 text-stone/80 [text-shadow:0_1px_14px_rgb(8_22_39/.7)]">
              {r.label[locale]}
            </p>
          ))}
        </div>

        {/* The end card sits on the clear end wall: an HTML overlay, not part of the render. */}
        <div className="hero-wall pointer-events-none absolute inset-0">
          <div data-hero-end="" className="hero-end pointer-events-auto border-t border-gold bg-ink-deep/88 p-5 text-stone sm:p-9">
            <p className="display t-h3">{w.endLine[locale]}</p>
            <Link href={hero.primary.href} className="btn btn-on-dark mt-6 w-full whitespace-nowrap px-5 sm:mt-7 sm:w-auto sm:px-7">
              {labels.startProject[locale]}
              <Arrow />
            </Link>
          </div>
        </div>

        <div data-hero-giveway="" className="relative">
          <div className="shell" data-hero-text="">
            <SplitWords
              as="h1"
              id="ch-hero-title"
              text={hero.headline[locale]}
              accentYear="sheen"
              mode="manual"
              className="display t-hero max-w-[19ch] [:root[lang=ar]_&]:max-w-[17ch]"
            />
            <div data-rule="manual" data-hero-rule="" aria-hidden="true" className="mt-9 h-px w-24 bg-gold" />
            <p data-reveal="manual" data-hero-fade="" className="t-lead mt-8 max-w-[36rem] text-fg/80">
              {hero.subline[locale]}
            </p>
            <div data-reveal="manual" data-hero-fade="" className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
              <Link href={hero.primary.href} className="btn btn-solid">
                {hero.primary.label[locale]}
                <Arrow />
              </Link>
              <Link href={hero.secondary.href} className="link-line">
                {hero.secondary.label[locale]}
              </Link>
            </div>
          </div>
        </div>
        <div data-hero-giveway="" className="absolute inset-0 pointer-events-none">
          <div data-reveal="manual" data-hero-fade="" className="scroll-cue bottom-10 hidden md:block" aria-hidden="true" />
        </div>

        {/* One line per building after the first, in the opening headline's place. Motion only. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[clamp(3.5rem,10vh,7rem)] hidden [.js-motion_&]:block">
          <div className="shell grid">
            {w.lines.map((line, i) => (
              <p
                key={i}
                data-hero-line=""
                className="display t-h1 col-start-1 row-start-1 max-w-[16ch] text-stone opacity-0 [text-shadow:0_1px_28px_rgb(8_22_39/.6)]"
              >
                {line.text[locale]}
              </p>
            ))}
          </div>
        </div>

        <p className="absolute inset-x-0 bottom-3 px-[var(--gutter)] text-end text-[0.7rem] text-stone/60">{w.smallPrint[locale]}</p>
      </div>
    </div>
  );
}
