import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { emails, salesPhone } from "@/content/global";
import { register } from "@/content/pages/home";
import { page } from "@/content/pages/start-a-project";
import type { Locale } from "@/content/types";
import { localePath } from "@/lib/format";
import { Monogram } from "@/components/ui/Monogram";
import { ProjectForm } from "@/components/form/ProjectForm";

export async function generateMetadata({ params }: PageProps<"/[locale]/start-a-project">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const l = locale as Locale;
  return {
    title: page.title[l],
    description: page.intro[l],
    alternates: {
      canonical: localePath("/start-a-project", l),
      languages: { ar: "/start-a-project", en: "/en/start-a-project", "x-default": "/start-a-project" },
    },
  };
}

/** Up to 7 confirmed names (not flagged verify), at most 2 per group, in register order. */
function clientStrip() {
  const out: typeof register.groups[number]["names"] = [];
  for (const g of register.groups) {
    out.push(...g.names.filter((n) => !n.verify).slice(0, page.panel.perGroup));
  }
  return out.slice(0, page.panel.maxNames);
}

export default async function StartAProjectPage({ params }: PageProps<"/[locale]/start-a-project">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const names = clientStrip();

  return (
    <div data-tone="stone" className="pt-[var(--header-h)]">
      <div className="grid lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-12">
        <div className="order-1 px-[var(--gutter)] py-14 sm:py-20 lg:order-2 lg:col-span-8 lg:px-[clamp(3rem,6vw,7rem)] lg:py-24">
          <div className="max-w-[48rem]">
            <h1 className="display t-h1">{page.title[l]}</h1>
            <p className="t-lead mt-6 text-ink/75">{page.intro[l]}</p>
            <div className="mt-14 sm:mt-20">
              <ProjectForm locale={l} />
            </div>
          </div>
        </div>

        <aside data-tone="ink" className="lattice order-2 flex flex-col justify-between gap-14 px-[var(--gutter)] py-16 lg:order-1 lg:col-span-4 lg:px-12 lg:py-24">
          <div>
            <Monogram size={56} strokeWidth={2.2} />
            <p className="display num mt-10 text-[clamp(3rem,5vw,4.5rem)] leading-none text-gold">{page.panel.year[l]}</p>
            <p className="mt-6 max-w-[20rem] text-fg/80">{page.panel.trust[l]}</p>
          </div>
          <ul className="border-t border-fg/15">
            {names.map((n) => (
              <li
                key={n.name.en}
                lang={n.latin && l === "ar" ? "en" : undefined}
                className="display border-b border-fg/10 py-3 text-[1.15rem] text-fg/85 [:root[lang=ar]_&]:text-[1rem]"
              >
                {n.name[l]}
              </li>
            ))}
          </ul>
          <div className="grid gap-1.5">
            <a href={`tel:${salesPhone.tel}`} className="ltr num self-start transition-colors duration-700 hover:text-gold">
              {salesPhone.number}
            </a>
            <a href={`mailto:${emails.sales}`} className="ltr self-start transition-colors duration-700 hover:text-gold">
              {emails.sales}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
