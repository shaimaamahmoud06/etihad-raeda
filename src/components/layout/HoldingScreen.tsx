import { Link } from "@/i18n/navigation";
import { holding } from "@/content/pages/holding-pages";
import { labels } from "@/content/global";
import type { Locale } from "@/content/types";
import { Monogram } from "@/components/ui/Monogram";
import { Arrow } from "@/components/ui/Arrow";

/* Holding pages and the 404 share one look: ink, the lattice, content at the bottom. */
export function HoldingScreen({ locale, title, lead }: { locale: Locale; title: string; lead?: string }) {
  return (
    <section data-tone="ink" className="lattice flex min-h-[80svh] flex-col justify-end pb-20 pt-[calc(var(--header-h)+5rem)]" aria-labelledby="holding-title">
      <div className="shell">
        <Monogram size={48} />
        <h1 id="holding-title" className="display t-h1 mt-10">
          {title}
        </h1>
        {lead && <p className="t-lead mt-6 text-fg/75">{lead}</p>}
        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
          {lead && (
            <Link href="/start-a-project" className="btn btn-solid">
              {labels.startProject[locale]}
              <Arrow />
            </Link>
          )}
          <Link href="/" className="link-line">
            {holding.back[locale]}
          </Link>
        </div>
      </div>
    </section>
  );
}
