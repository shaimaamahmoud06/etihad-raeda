import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { meta } from "@/content/global";
import { chapterOrder, chapterTones } from "@/content/pages/home";
import type { Locale } from "@/content/types";
import { effects } from "@/design/motion";
import { localePath } from "@/lib/format";
import { Intro } from "@/components/layout/Intro";
import { ChapterShell } from "@/components/chapters/ChapterShell";
import { registry } from "@/components/chapters/registry";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const l = locale as Locale;
  return {
    title: meta.homeTitle[l],
    description: meta.homeDescription[l],
    alternates: {
      canonical: localePath("/", l),
      languages: { ar: "/", en: "/en", "x-default": "/" },
    },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const pageUrl = meta.siteUrl + localePath("/", l);
  const shown = [...chapterOrder];

  return (
    <>
      <Intro locale={l} />
      {shown.map((name, i) => {
        const entry = registry[name];
        const tone = chapterTones[name];
        const prevTone = i > 0 ? chapterTones[shown[i - 1]] : undefined;
        return (
          <ChapterShell
            key={name}
            name={name}
            tone={tone}
            prevTone={prevTone}
            labelledBy={`ch-${name}-title`}
            depth={entry.depth && effects.depthExit}
            className={entry.className}
          >
            <entry.Component locale={l} pageUrl={pageUrl} />
          </ChapterShell>
        );
      })}
    </>
  );
}
