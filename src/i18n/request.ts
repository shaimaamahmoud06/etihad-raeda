import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  // All words live in src/content; next-intl only handles routing and the current language.
  return { locale, messages: {}, timeZone: "Africa/Tripoli" };
});
