import { whatsapp } from "@/content/global";
import type { Locale } from "@/content/types";
import { fill } from "./format";

/** https://wa.me/<number>?text=<message>. {link} is the full address of the current page. */
export function waHref(locale: Locale, link: string, item?: { name: string; code: string }): string {
  const template = item ? whatsapp.itemMessage[locale] : whatsapp.generalMessage[locale];
  const text = fill(template, { item: item?.name ?? "", code: item?.code ?? "", link });
  return `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(text)}`;
}
