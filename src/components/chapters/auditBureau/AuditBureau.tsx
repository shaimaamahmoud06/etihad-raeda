import { Link } from "@/i18n/navigation";
import { auditBureau } from "@/content/pages/home";
import { formatNumber, twoDigit } from "@/lib/format";
import { Arrow } from "@/components/ui/Arrow";
import type { ChapterProps } from "../registry";

/* Ch.3 One building, told slowly. Scale stated quietly. No photograph exists yet,
   so the visual is a drawn section of the building. */
export function AuditBureau({ locale }: ChapterProps) {
  const a = auditBureau;
  const area = formatNumber(a.area, locale);
  const floors = Array.from({ length: a.floors }, (_, i) => i);

  return (
    <div data-audit-stage="" className="lattice flex min-h-svh flex-col justify-center pb-16 pt-[calc(var(--header-h)+2.5rem)]">
      <div className="shell grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 sm:gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div className="grid gap-3 sm:gap-5">
            {a.lines.map((line, i) => {
              const text = line[locale];
              const cls = "display t-h2 max-w-[18ch]";
              if (i === 0)
                return (
                  <h2 key={i} id="ch-auditBureau-title" data-audit-line="" className={cls}>
                    {text}
                  </h2>
                );
              if (text.includes("{n}")) {
                const [before, after] = text.split("{n}");
                return (
                  <p key={i} data-audit-line="" className={cls}>
                    {before}
                    <span aria-hidden="true" data-count={a.area} data-count-manual="" className="num text-accent">
                      {area}
                    </span>
                    <span className="sr-only">{area}</span>
                    {after}
                  </p>
                );
              }
              return (
                <p key={i} data-audit-line="" className={cls}>
                  {text}
                </p>
              );
            })}
          </div>

          <div data-audit-close="" className="mt-12 sm:mt-16">
            <div className="h-px w-16 bg-gold" aria-hidden="true" />
            <p className="t-lead mt-8 text-fg/75">{a.closing[locale]}</p>
            <Link href={a.link.href} className="link-line mt-6 text-gold transition-colors duration-700 hover:text-stone">
              {a.link.label[locale]}
              <Arrow />
            </Link>
          </div>
        </div>

        <div aria-hidden="true" className="w-14 justify-self-end sm:w-24 lg:col-span-3 lg:col-start-10 lg:w-full lg:max-w-[16rem]">
          <p className="label num text-end text-[0.68rem] tracking-[0.2em] text-gold sm:text-[0.75rem]">
            <span data-floor-count="">{twoDigit(a.floors, locale)}</span> <span className="text-gold/40">/ {twoDigit(a.floors, locale)}</span>
          </p>
          <div className="mx-auto mt-3 h-px w-[70%] bg-fg/30" />
          <div data-floors="" className="relative mt-3 flex flex-col-reverse gap-1.5 sm:gap-2">
            {floors.map((i) => (
              <div key={i} data-floor="" className="h-[clamp(0.9rem,2.4vh,1.35rem)] border border-gold/55 bg-gold/78" />
            ))}
            <div data-scan="" className="absolute inset-x-[-6%] bottom-0 h-px bg-gold opacity-0" />
          </div>
          <div className="-mx-[6%] mt-2 h-px bg-fg/40" />
        </div>
      </div>
    </div>
  );
}
