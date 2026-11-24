"use client";

import type { Locale } from "@/content/types";
import { labels } from "@/content/global";
import { track } from "@/lib/track";
import { waHref } from "@/lib/whatsapp";

/* The B2C door (§10). Opens wa.me in a new tab with a pre-typed message.
   Prices are never shown on the site; they are given in the chat. */

export function WhatsAppGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M9 1.6a7.3 7.3 0 0 0-6.3 11l-1 3.8 3.9-1A7.3 7.3 0 1 0 9 1.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M6.4 5.2c.2-.3.5-.3.7-.3h.4c.2 0 .3.1.4.3l.6 1.4c.1.2 0 .4-.1.5l-.4.5c-.1.1-.1.3 0 .4.3.6.8 1.1 1.3 1.5.4.3.8.5 1.2.7.1.1.3 0 .4-.1l.5-.6c.1-.2.3-.2.5-.1l1.4.7c.2.1.3.2.3.4 0 .4-.1 1-.6 1.4-.5.4-1.3.6-2.2.3a8 8 0 0 1-3.2-2 7.5 7.5 0 0 1-1.6-2.4c-.3-.9-.1-1.7.4-2.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

type Props = {
  locale: Locale;
  label: string;
  /** Full address of the current page, for the {link} in the message. */
  pageUrl: string;
  item?: { name: string; code: string; collection: string };
  placement: "home-broadening" | "home-closing";
  variant?: "line" | "solid";
  className?: string;
};

export function WhatsAppButton({ locale, label, pageUrl, item, placement, variant = "line", className = "" }: Props) {
  const href = waHref(locale, pageUrl, item ? { name: item.name, code: item.code } : undefined);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn ${variant === "solid" ? "btn-solid" : "btn-line"} ${className}`}
      onClick={() =>
        track("wa_click", {
          item: item?.name ?? "general",
          code: item?.code ?? "",
          collection: item?.collection ?? "",
          placement,
        })
      }
    >
      <WhatsAppGlyph />
      <span>{label}</span>
      <span className="sr-only">{labels.newTab[locale]}</span>
    </a>
  );
}
