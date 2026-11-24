import type { L, Verify } from "./types";

/* The photo library: one entry per real client photograph, used by name.
   To add a real photo: put the file in public/photos/ (about 2400 px wide),
   then add src: "/photos/DSC07130.jpg" to its entry. It replaces the placeholder everywhere.
   Never use a generated, AI or stock image here. */

export type Mood = "ink" | "walnut" | "cognac" | "stone" | "oak" | "teal" | "rose";

export type Photo = {
  /** Camera file number, or null when no photo has been supplied. */
  dsc: string | null;
  subject: L;
  /** "transfer": picked but the file is not added yet. "none": no photo exists. */
  status: "transfer" | "none";
  mood: Mood;
  src?: string;
  verify?: Verify;
};

export const photos = {
  plenary: {
    dsc: "DSC01335",
    subject: { ar: "قاعة الجلسات الكبرى", en: "Grand plenary chamber" },
    status: "transfer",
    mood: "ink",
    verify: "Whose chamber is DSC00864–01403, and may it be shown? Shown unnamed.",
  },
  zawiya: {
    dsc: "DSC07130",
    subject: { ar: "قاعة المجلس البلدي، بلدية الزاوية المركز", en: "Council chamber, Zawiya Centre Municipality" },
    status: "transfer",
    mood: "walnut",
  },
  ittihad: {
    dsc: null,
    subject: { ar: "متحف نادي الاتحاد", en: "Al-Ittihad Club Museum" },
    status: "none",
    mood: "ink",
    verify: "No museum photos in the transfer.",
  },
  radius: {
    dsc: null,
    subject: { ar: "قاعات الاجتماعات والاستقبال، مع مكتب ريديوس الهندسي", en: "Meeting rooms and reception, with Radius Design" },
    status: "none",
    mood: "oak",
    verify: "Which project (FB post, 18 Nov 2026)?",
  },
  swehli: {
    dsc: null,
    subject: { ar: "نادي السويحلي، مصراتة", en: "Al-Swehli Club, Misrata" },
    status: "none",
    mood: "teal",
  },
  libyana: {
    dsc: null,
    subject: { ar: "ليبيانا", en: "Libyana" },
    status: "none",
    mood: "stone",
  },
  majlis: {
    dsc: "DSC04206",
    subject: { ar: "المجلس: رخام وثريات برونزية", en: "The majlis: marble and bronze chandeliers" },
    status: "transfer",
    mood: "teal",
    verify: "Whose majlis is DSC04097–04209?",
  },
  walnut: {
    dsc: "DSC07460",
    subject: { ar: "تفصيل ألواح الجوز", en: "Walnut joinery detail" },
    status: "transfer",
    mood: "walnut",
  },
  marble: {
    dsc: "DSC07480",
    subject: { ar: "طاولة بسطح حجري", en: "Stone-top table" },
    status: "transfer",
    mood: "stone",
  },
  leather: {
    dsc: "DSC05467",
    subject: { ar: "حافة مكتب بجلد الكونياك، الخياطة", en: "Cognac leather desk edge, stitching" },
    status: "transfer",
    mood: "cognac",
  },
  textile: {
    dsc: "DSC05450",
    subject: { ar: "ثنية قماش صوفي وردي", en: "Rose wool fabric fold" },
    status: "transfer",
    mood: "rose",
  },
  execSuite: {
    dsc: "DSC07444",
    subject: { ar: "الجناح التنفيذي: جوز وترافرتين", en: "Executive suite: walnut and travertine" },
    status: "transfer",
    mood: "walnut",
    verify: "Which GNU ministry or office is DSC07444–07522, and may we name it?",
  },
  smallOffice: {
    dsc: "DSC00017",
    subject: { ar: "مكتب مدير صغير", en: "Small manager's office" },
    status: "transfer",
    mood: "oak",
  },
  collExecutive: {
    dsc: "DSC00026",
    subject: { ar: "مكتب صغير، كراسي جلد كونياك", en: "Small office, cognac leather chairs" },
    status: "transfer",
    mood: "cognac",
  },
  collWorkstations: {
    dsc: "DSC05487",
    subject: { ar: "مكتب معاصر", en: "Contemporary office" },
    status: "transfer",
    mood: "stone",
  },
  collLounge: {
    dsc: "DSC05352",
    subject: { ar: "أريكة معيارية زرقاء", en: "Blue modular sofa" },
    status: "transfer",
    mood: "ink",
  },
  storefront: {
    dsc: null,
    subject: { ar: "واجهة صالة العرض ليلاً", en: "The storefront at night" },
    status: "none",
    mood: "ink",
    verify: "Night shot of the new storefront; is it separate from Hay Al-Andalus?",
  },
} satisfies Record<string, Photo>;

export type PhotoName = keyof typeof photos;
