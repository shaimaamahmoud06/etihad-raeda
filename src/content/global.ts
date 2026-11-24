import type { L } from "./types";

/* Everything the layout says: brand, meta, menu, contact details, footer, labels.
   Edit words here; no code changes needed. */

export const brand = {
  name: { ar: "شركة الاتحاد الرائدة للأثاث المكتبي", en: "Etihad Raeda Office Furniture" } as L,
  short: { ar: "الاتحاد الرائدة", en: "Etihad Raeda" } as L,
  /** The Latin lockup line under the wordmark, as in the brand book. */
  lockupSub: "Office Furniture",
  seal: { ar: "منذ ١٩٦٤", en: "Since 1964" } as L,
  sealCity: { ar: "منذ ١٩٦٤ · طرابلس", en: "Since 1964 · Tripoli" } as L,
  founded: 1964,
  homeLabel: { ar: "الاتحاد الرائدة، الصفحة الرئيسية", en: "Etihad Raeda, home" } as L,
};

export const meta = {
  homeTitle: {
    ar: "الاتحاد الرائدة للأثاث المكتبي | منذ ١٩٦٤",
    en: "Etihad Raeda Office Furniture | Since 1964",
  } as L,
  homeDescription: {
    ar: "نوفّر حلولاً متكاملة للأثاث المكتبي، من اختيار القطع المناسبة إلى التوريد والتركيب، مع اهتمام بكل تفصيل يجعل المساحة أكثر انسجاماً مع احتياجاتها",
    en: "We bring together carefully selected office furniture and complete furnishing solutions, from sourcing to installation, with attention to every detail that makes a workspace work.",
  } as L,
  /** Site address, used for canonical links and the WhatsApp {link}. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://raeda.ly",
};

export type MenuItem = { label: L; href: string };

export const menu: MenuItem[] = [
  { label: { ar: "المشاريع", en: "Projects" }, href: "/projects" },
  { label: { ar: "للمؤسسات", en: "Institutions" }, href: "/institutions" },
  { label: { ar: "مسيرتنا", en: "Heritage" }, href: "/heritage" },
  { label: { ar: "لمكتبك", en: "Your Office" }, href: "/your-office" },
  { label: { ar: "صالة العرض", en: "Showroom" }, href: "/showroom" },
];

export const phones = [
  { number: "+218 93 555 6660", tel: "+218935556660", whatsapp: true },
  { number: "+218 91 560 0560", tel: "+218915600560", whatsapp: false },
  { number: "+218 92 217 0288", tel: "+218922170288", whatsapp: false },
  { number: "+218 21 722 9641", tel: "+218217229641", whatsapp: false },
];

/** The sales phone shown on the form page (currently the second phone). */
export const salesPhone = phones[1];

export const emails = { sales: "sales@raeda.ly", info: "info@raeda.ly" };

export const address = {
  text: {
    ar: "حي الأندلس، قرب جامع الشريف، طرابلس، ليبيا",
    en: "Hay Al-Andalus, near Al-Sharif Mosque, Tripoli, Libya",
  } as L,
  /** verify: exact pin */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Etihad Raeda Office Furniture, Hay Al-Andalus, Tripoli, Libya"),
};

export const whatsapp = {
  /** verify: which number is for consumers (B2C) and which is for institutional sales. */
  number: "218935556660",
  itemMessage: {
    ar: "مرحباً، أودّ معرفة سعر: {item} ({code}). {link}",
    en: "Hello, I'd like the price of: {item} ({code}). {link}",
  } as L,
  /** Not in copy deck v1. */
  generalMessage: {
    ar: "مرحباً، أودّ الاستفسار عن مجموعات «لمكتبك». {link}",
    en: "Hello, I'd like to ask about the Your Office collections. {link}",
  } as L,
};

export const socials = [
  {
    label: { ar: "فيسبوك", en: "Facebook" } as L,
    /** verify: exact page URL */
    href: "https://www.facebook.com/search/top?q=" + encodeURIComponent("الاتحاد الرائدة للأثاث المكتبي"),
  },
  { label: { ar: "إنستغرام", en: "Instagram" } as L, href: "https://www.instagram.com/etihadraedaofficeproject/" },
  { label: { ar: "تيك توك", en: "TikTok" } as L, href: "https://www.tiktok.com/@etihad.raeda.office" },
];

/** Footer headings were not in copy deck v1. They need the copywriter's review. */
export const footer = {
  line: {
    ar: "الاتحاد الرائدة للأثاث المكتبي — منذ ١٩٦٤، طرابلس، ليبيا.",
    en: "Etihad Raeda Office Furniture — since 1964, Tripoli, Libya.",
  } as L,
  visit: { ar: "زُرنا", en: "Visit" } as L,
  call: { ar: "اتصل بنا", en: "Call" } as L,
  write: { ar: "راسلنا", en: "Write" } as L,
  follow: { ar: "تابعنا", en: "Follow" } as L,
  maps: { ar: "خرائط Google", en: "Google Maps" } as L,
  whatsappTag: { ar: "واتساب", en: "WhatsApp" } as L,
  rights: { ar: "© ٢٠٢٦ جميع الحقوق محفوظة", en: "© 2026 All rights reserved" } as L,
};

export const labels = {
  skip: { ar: "انتقل إلى المحتوى", en: "Skip to content" } as L,
  startProject: { ar: "ابدأ مشروعك", en: "Start a project" } as L,
  menu: { ar: "القائمة", en: "Menu" } as L,
  close: { ar: "إغلاق", en: "Close" } as L,
  /** The language switch shows the *other* language. */
  switchShort: { ar: "EN", en: "AR" } as L,
  switchLabel: { ar: "English", en: "العربية" } as L,
  newTab: { ar: "(يفتح في نافذة جديدة)", en: "(opens in a new tab)" } as L,
  photoPending: { ar: "صورة حقيقية · الملف قيد الانتظار", en: "Real photograph · file pending" } as L,
  photoNone: { ar: "لا توجد صورة بعد", en: "No photo supplied yet" } as L,
  mainNav: { ar: "القائمة الرئيسية", en: "Main menu" } as L,
};
