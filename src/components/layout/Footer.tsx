import { Link } from "@/i18n/navigation";
import { address, brand, emails, footer, labels, phones, socials } from "@/content/global";
import type { Locale } from "@/content/types";
import { Monogram } from "@/components/ui/Monogram";

/* The footer (§6.5). Footer headings were not in copy deck v1; they need the copywriter's review. */

function NewTab({ locale }: { locale: Locale }) {
  return <span className="sr-only">{labels.newTab[locale]}</span>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="eyebrow mb-5 text-gold">{children}</h2>;
}

export function Footer({ locale }: { locale: Locale }) {
  const other: Locale = locale === "ar" ? "en" : "ar";
  return (
    <footer className="bg-ink-deep text-stone">
      <div className="shell grid gap-12 pb-10 pt-20 md:grid-cols-12 md:gap-x-8 lg:pt-28">
        <div className="md:col-span-12 lg:col-span-3">
          <Monogram size={56} strokeWidth={2.2} />
          <p className="mt-8 max-w-[24rem] text-stone/80">{footer.line[locale]}</p>
        </div>

        <div className="md:col-span-4 lg:col-span-3">
          <Heading>{footer.visit[locale]}</Heading>
          <p className="text-stone/80">{address.text[locale]}</p>
          <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-line mt-3 hover:text-gold">
            {footer.maps[locale]}
            <NewTab locale={locale} />
          </a>
        </div>

        <div className="md:col-span-4 lg:col-span-3">
          <Heading>{footer.call[locale]}</Heading>
          <ul className="grid gap-1.5">
            {phones.map((p) => (
              <li key={p.tel} className="flex flex-wrap items-baseline gap-x-3">
                <a href={`tel:${p.tel}`} className="ltr num whitespace-nowrap transition-colors duration-700 hover:text-gold">
                  {p.number}
                </a>
                {p.whatsapp && <span className="text-[0.8rem] text-stone/60">{footer.whatsappTag[locale]}</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4 lg:col-span-3">
          <Heading>{footer.write[locale]}</Heading>
          <ul className="grid gap-1.5">
            {[emails.sales, emails.info].map((e) => (
              <li key={e}>
                <a href={`mailto:${e}`} className="ltr transition-colors duration-700 hover:text-gold">
                  {e}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Heading>{footer.follow[locale]}</Heading>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-line hover:text-gold">
                    {s.label[locale]}
                    <NewTab locale={locale} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="shell">
        <div className="hairline" />
        <div className="flex flex-col gap-3 py-8 text-[0.8rem] text-stone/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {brand.name[locale]} <span className="text-gold">·</span> {footer.rights[locale]}
          </p>
          <Link
            href="/"
            locale={other}
            lang={other}
            className="link-line label text-[0.72rem] font-semibold tracking-[0.18em] hover:text-stone"
          >
            {labels.switchLabel[locale]}
          </Link>
        </div>
      </div>
    </footer>
  );
}
