import { register } from "@/content/pages/home";
import { twoDigit } from "@/lib/format";
import { SplitWords } from "@/components/ui/SplitWords";
import type { ChapterProps } from "../registry";

/* Ch.2 The Register. The client roster is the claim: an honour roll. Names only, grouped,
   numbered, no logos, no carousel. Direction 04, "the split face". */
export function Register({ locale }: ChapterProps) {
  const rows = register.groups.flatMap((g) => g.names.map((n) => ({ ...n, group: g.label })));
  return (
    <div className="chapter-pad">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-4">
          <p data-reveal="" className="eyebrow text-accent">
            {register.eyebrow[locale]}
          </p>
          <SplitWords
            as="h2"
            id="ch-register-title"
            text={register.headline[locale]}
            className="display t-h2 mt-6 max-w-[16ch] [:root[lang=ar]_&]:max-w-[14ch]"
          />
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <ol data-register-list="" className="border-t border-fg/10">
            {rows.map((r, i) => (
              <li key={r.name.en} data-register-row="" className="register-row relative flex items-baseline gap-5 border-b border-fg/10 py-3.5">
                <span className="label num w-6 shrink-0 text-[0.68rem] text-fg/60">{twoDigit(i + 1, locale)}</span>
                <span
                  data-register-name=""
                  lang={r.latin && locale === "ar" ? "en" : undefined}
                  className="register-name display min-w-0 flex-1 text-[1.45rem] leading-snug [:root[lang=ar]_&]:text-[1.15rem] [:root[lang=ar]_&]:leading-relaxed"
                >
                  {r.name[locale]}
                </span>
                <span className="label shrink-0 text-end text-[0.6rem] uppercase tracking-[0.18em] text-fg/50 [:root[lang=ar]_&]:text-[0.78rem]">
                  {r.group[locale]}
                </span>
                <span data-register-line="" aria-hidden="true" className="register-line absolute inset-x-0 -bottom-px h-px bg-gold" />
              </li>
            ))}
          </ol>
          <p data-reveal="" className="mt-12 text-[0.9rem] text-fg/65">
            {register.footnote[locale]}
          </p>
        </div>
      </div>
    </div>
  );
}
