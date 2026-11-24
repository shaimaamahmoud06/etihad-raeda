import { Cormorant_Garamond, IBM_Plex_Sans_Arabic, Montserrat, Noto_Kufi_Arabic } from "next/font/google";

/* Fonts load with display: swap and are self-hosted at build time.
   When they finish loading, every scroll scene is re-measured (Arabic line lengths change). */

export const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-kufi",
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-plex-ar",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-montserrat",
});

export const fontVariables = [kufi.variable, plexArabic.variable, cormorant.variable, montserrat.variable].join(" ");
