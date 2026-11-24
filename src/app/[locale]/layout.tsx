import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/design/fonts";
import { labels, meta } from "@/content/global";
import { chapterOrder, chapterTones } from "@/content/pages/home";
import type { Locale } from "@/content/types";
import { dirOf } from "@/lib/format";
import { HEAD_SCRIPT } from "@/motion/intro";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#081627",
};

export const metadata: Metadata = {
  metadataBase: new URL(meta.siteUrl),
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const firstTone = chapterTones[chapterOrder[0]];
  const firstChapterDark = firstTone === "ink" || firstTone === "ink-deep";

  return (
    <html lang={l} dir={dirOf(l)} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <NextIntlClientProvider locale={l} messages={{}}>
          <a href="#main" className="skip-link">
            {labels.skip[l]}
          </a>
          <SmoothScroll />
          <Header locale={l} firstChapterDark={firstChapterDark} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer locale={l} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
