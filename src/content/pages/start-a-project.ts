import type { L, Verify } from "../types";

/* The whole "Start a project" form. Every question, option and message lives here.
   Adding a step or an option needs no code change.
   `name` and `value` are the codes the sales team receives: short, lowercase, no spaces, unique. */

export type Option = { value: string; label: L };

export type ChoicePart = {
  kind: "choice";
  name: string;
  required: boolean;
  columns?: 1 | 2;
  /** Optional sub-question shown above the options. */
  question?: L;
  options: Option[];
};

export type NumbersPart = {
  kind: "numbers";
  /** At least one box must contain a digit. */
  fields: { name: string; label: L }[];
};

export type FilePart = {
  kind: "file";
  name: string;
  label: L;
  hint: L;
  choose: L;
  remove: L;
  maxBytes: number;
  accept: string[];
};

export type CityPart = {
  kind: "city";
  name: string;
  required: boolean;
  autocomplete: string;
  quickPicks: L[];
};

export type TextField = {
  name: string;
  label: L;
  required: boolean;
  type?: "text" | "tel" | "email";
  autocomplete?: string;
  prefill?: string;
  ltr?: boolean;
  /** Masked in the server log. */
  private?: boolean;
};

export type FieldsPart = { kind: "fields"; fields: TextField[] };

export type Part = ChoicePart | NumbersPart | FilePart | CityPart | FieldsPart;

export type Step = { id: string; question: L; help?: L; parts: Part[] };

export const page = {
  title: { ar: "ابدأ مشروعك", en: "Start a project" } as L,
  /** verify: response time */
  intro: {
    ar: "أخبرنا عن مشروعك. يتواصل معك مستشار مشاريع خلال يوم عمل واحد.",
    en: "Tell us about your project. A project consultant will be in touch within one working day.",
  } as L,
  panel: {
    year: { ar: "١٩٦٤", en: "1964" } as L,
    trust: {
      ar: "منذ ١٩٦٤ · موثوق من الوزارات والهيئات وكبرى الشركات في ليبيا",
      en: "Since 1964 · Trusted by Libya's ministries, institutions and largest companies",
    } as L,
    /** Up to 7 confirmed names, at most 2 per group, in register order. */
    maxNames: 7,
    perGroup: 2,
  },
};

const MB = 1024 * 1024;

export const steps: Step[] = [
  {
    id: "organisation",
    question: { ar: "ما نوع جهتك؟", en: "What kind of organisation are you?" },
    parts: [
      {
        kind: "choice",
        name: "organisation_type",
        required: true,
        columns: 2,
        options: [
          { value: "government", label: { ar: "جهة حكومية", en: "Government" } },
          { value: "company", label: { ar: "شركة", en: "Company" } },
          { value: "bank", label: { ar: "مصرف", en: "Bank" } },
          { value: "education", label: { ar: "تعليم", en: "Education" } },
          { value: "healthcare", label: { ar: "صحة", en: "Healthcare" } },
          { value: "hospitality", label: { ar: "ضيافة", en: "Hospitality" } },
          { value: "other", label: { ar: "أخرى", en: "Other" } },
        ],
      },
    ],
  },
  {
    id: "project",
    question: { ar: "ماذا تجهّز؟", en: "What are you fitting out?" },
    parts: [
      {
        kind: "choice",
        name: "project_type",
        required: true,
        columns: 1,
        options: [
          { value: "new_hq", label: { ar: "مقرّ جديد", en: "A new headquarters" } },
          { value: "floors", label: { ar: "طابق أو أكثر", en: "One or more floors" } },
          { value: "meeting_rooms", label: { ar: "قاعات اجتماعات أو مجالس", en: "Meeting or council rooms" } },
          { value: "refurbishment", label: { ar: "تجديد مساحة قائمة", en: "Refurbishing an existing space" } },
          { value: "supply_only", label: { ar: "توريد فقط", en: "Supply only" } },
        ],
      },
    ],
  },
  {
    id: "size",
    question: { ar: "ما حجم المشروع تقريباً؟", en: "Roughly how large is the project?" },
    help: { ar: "التقدير يكفي.", en: "An estimate is fine." },
    parts: [
      {
        kind: "numbers",
        fields: [
          { name: "area_m2", label: { ar: "المساحة (م²)", en: "Area (m²)" } },
          { name: "staff", label: { ar: "عدد الموظفين", en: "Number of staff" } },
          { name: "floors", label: { ar: "عدد الطوابق", en: "Number of floors" } },
        ],
      },
    ],
  },
  {
    id: "timing",
    question: { ar: "متى تحتاجه؟", en: "When do you need it?" },
    parts: [
      {
        // These four options are not in copy deck v1 and need the copywriter's review.
        kind: "choice",
        name: "timeline",
        required: true,
        columns: 2,
        options: [
          { value: "within_3_months", label: { ar: "خلال ثلاثة أشهر", en: "Within three months" } },
          { value: "3_to_6_months", label: { ar: "من ثلاثة إلى ستة أشهر", en: "Three to six months" } },
          { value: "6_to_12_months", label: { ar: "من ستة أشهر إلى سنة", en: "Six months to a year" } },
          { value: "not_decided", label: { ar: "لم يُحدَّد بعد", en: "Not decided yet" } },
        ],
      },
      {
        kind: "choice",
        name: "tender",
        required: true,
        columns: 2,
        question: { ar: "هل هناك مناقصة أو كراسة شروط؟", en: "Is there a tender or RFQ?" },
        options: [
          { value: "yes", label: { ar: "نعم", en: "Yes" } },
          { value: "no", label: { ar: "لا", en: "No" } },
        ],
      },
      {
        kind: "file",
        name: "attachment",
        label: { ar: "أرفق المخططات أو جدول الكميات (اختياري)", en: "Attach drawings or a bill of quantities (optional)" },
        hint: { ar: "PDF أو DWG أو صور أو جداول، حتى ١٠ ميغابايت.", en: "PDF, DWG, images or spreadsheets, up to 10 MB." },
        choose: { ar: "اختر ملفاً", en: "Choose a file" },
        remove: { ar: "إزالة الملف", en: "Remove file" },
        maxBytes: 10 * MB,
        accept: [".pdf", ".dwg", ".dxf", ".xls", ".xlsx", ".csv", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".zip"],
      },
    ],
  },
  {
    id: "city",
    question: { ar: "في أي مدينة؟", en: "Which city?" },
    parts: [
      {
        kind: "city",
        name: "city",
        required: true,
        autocomplete: "address-level2",
        quickPicks: [
          { ar: "طرابلس", en: "Tripoli" },
          { ar: "بنغازي", en: "Benghazi" },
          { ar: "مصراتة", en: "Misrata" },
          { ar: "الزاوية", en: "Zawiya" },
          { ar: "سبها", en: "Sabha" },
          { ar: "البيضاء", en: "Bayda" },
        ],
      },
    ],
  },
  {
    id: "contact",
    question: { ar: "كيف نصل إليك؟", en: "How should we reach you?" },
    parts: [
      {
        kind: "fields",
        fields: [
          { name: "name", label: { ar: "الاسم", en: "Name" }, required: true, autocomplete: "name", private: true },
          { name: "job_title", label: { ar: "المسمّى الوظيفي", en: "Job title" }, required: false, autocomplete: "organization-title" },
          { name: "organisation", label: { ar: "الجهة", en: "Organisation" }, required: true, autocomplete: "organization" },
          {
            name: "phone",
            label: { ar: "الهاتف", en: "Phone" },
            required: true,
            type: "tel",
            prefill: "+218 ",
            ltr: true,
            autocomplete: "tel",
            private: true,
          },
          { name: "email", label: { ar: "البريد الإلكتروني", en: "Email" }, required: false, type: "email", ltr: true, autocomplete: "email", private: true },
        ],
      },
    ],
  },
];

/* Not in copy deck v1: buttons, progress and validation messages need the copywriter's review. */
export const messages = {
  stepOf: { ar: "الخطوة {n} من {total}", en: "Step {n} of {total}" } as L,
  back: { ar: "السابق", en: "Back" } as L,
  next: { ar: "التالي", en: "Next" } as L,
  send: { ar: "أرسل الطلب", en: "Send request" } as L,
  sending: { ar: "جارٍ الإرسال…", en: "Sending…" } as L,
  optional: { ar: "(اختياري)", en: "(optional)" } as L,
  errors: {
    choice: { ar: "اختر إجابة للمتابعة.", en: "Choose an answer to continue." } as L,
    numbers: { ar: "أدخل رقماً واحداً على الأقل.", en: "Enter at least one figure." } as L,
    required: { ar: "هذا الحقل مطلوب.", en: "This field is required." } as L,
    phone: { ar: "تحقّق من رقم الهاتف.", en: "Check the phone number." } as L,
    email: { ar: "تحقّق من البريد الإلكتروني.", en: "Check the email address." } as L,
    fileSize: { ar: "الملف أكبر من الحجم المسموح.", en: "The file is larger than allowed." } as L,
  },
  sendError: { ar: "تعذّر الإرسال. حاول مرة أخرى، أو راسلنا على", en: "That didn't go through. Try again, or write to" } as L,
  sent: {
    title: { ar: "وصلنا طلبك.", en: "We have your request." } as L,
    reference: { ar: "رقم الطلب: {reference}", en: "Request reference: {reference}" } as L,
    prompt: { ar: "تفضّل تحديد موعد مكالمة الآن؟", en: "Prefer to book a call now?" } as L,
    book: { ar: "احجز مكالمة", en: "Book a call" } as L,
    /** verify: response time */
    note: { ar: "يتواصل معك مستشار مشاريع خلال يوم عمل واحد.", en: "A project consultant will be in touch within one working day." } as L,
  },
  booking: {
    tag: { ar: "تقويم الحجز (Cal.com) · قيد الربط", en: "Booking calendar (Cal.com) · not connected yet" } as L,
    note: { ar: "توقيت طرابلس، من الأحد إلى الخميس. يُملأ تلقائياً من بيانات الطلب.", en: "Tripoli time, Sunday to Thursday. Prefilled from your request." } as L,
    simulate: { ar: "محاكاة الحجز", en: "Simulate a booking" } as L,
  },
  booked: {
    title: {
      ar: "موعدك محجوز. سيتصل بك مستشار المشاريع في الوقت المحدد.",
      en: "You're booked. Your project consultant will call at the agreed time.",
    } as L,
  },
};

export const verify: Verify = "Response time \"within one working day\".";
