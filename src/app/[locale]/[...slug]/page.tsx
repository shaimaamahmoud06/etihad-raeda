import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { menu } from "@/content/global";
import { holding, holdingSlugs } from "@/content/pages/holding-pages";
import type { Locale } from "@/content/types";
import { HoldingScreen } from "@/components/layout/HoldingScreen";

/* Holding pages for sections built in later phases. Not indexed. Anything else is a 404.
   The five known slugs are prerendered; validation feedback is off for unknown ones. */
export const instant = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => holdingSlugs.map((slug) => ({ locale, slug: [slug] })));
}

function find(slug: string[]) {
  if (slug.length !== 1) return null;
  return menu.find((m) => m.href === `/${slug[0]}`) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[...slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = find(slug);
  if (!item || !hasLocale(routing.locales, locale)) return {};
  return { title: item.label[locale as Locale], robots: { index: false, follow: true } };
}

export default async function HoldingPage({ params }: PageProps<"/[locale]/[...slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const item = find(slug);
  if (!item) notFound();
  const l = locale as Locale;
  return <HoldingScreen locale={l} title={item.label[l]} lead={holding.lead[l]} />;
}
