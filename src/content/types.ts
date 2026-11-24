/** A text pair. Arabic is the source; English is an adaptation. Both are always filled. */
export type L = { ar: string; en: string };

export type Locale = "ar" | "en";

/** A chapter colour scheme (§4.2). */
export type Tone = "ink" | "ink-deep" | "stone" | "stone-deep";

/** An unconfirmed claim. Never rendered; it lives next to the text it qualifies. */
export type Verify = string;

/** Text still waiting for the client, written in [square brackets]. Shown in pending style. */
export type PendingText = L & { pending?: boolean; verify?: Verify };

export const pick = (text: L, locale: Locale) => text[locale];
