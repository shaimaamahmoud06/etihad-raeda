import { getLocale } from "next-intl/server";
import { notFound as copy } from "@/content/pages/holding-pages";
import type { Locale } from "@/content/types";
import { HoldingScreen } from "@/components/layout/HoldingScreen";

export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  return <HoldingScreen locale={locale} title={copy.title[locale]} />;
}
