import type { Locale } from "@/content/types";

const EASTERN = "٠١٢٣٤٥٦٧٨٩";

/** Latin digits → Eastern Arabic digits. */
export const toArabicDigits = (s: string) => s.replace(/[0-9]/g, (d) => EASTERN[Number(d)]);

/** Arabic (U+0660…) and Persian (U+06F0…) digits → Latin digits. */
export const toLatinDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

/** A number in the page language: Eastern Arabic digits with «٬» in Arabic, en-GB in English. */
export function formatNumber(n: number, locale: Locale): string {
  const latin = Math.round(n).toLocaleString("en-GB");
  return locale === "ar" ? toArabicDigits(latin.replace(/,/g, "٬")) : latin;
}

/** Two-digit index: 01, 02… or «٠١، ٠٢»… */
export function twoDigit(n: number, locale: Locale): string {
  const s = String(n).padStart(2, "0");
  return locale === "ar" ? toArabicDigits(s) : s;
}

/** Plan figures are written without thousands separators. */
export function planFigure(n: number, locale: Locale): string {
  const s = String(Math.round(n));
  return locale === "ar" ? toArabicDigits(s) : s;
}

/** Replace {key} placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

/** A path in the given language: Arabic lives at /, English at /en. */
export function localePath(path: string, locale: Locale): string {
  const clean = path === "/" ? "" : path;
  return locale === "ar" ? clean || "/" : `/en${clean}`;
}
