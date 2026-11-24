import type { L, PendingText, Tone, Verify } from "../types";
import type { PhotoName } from "../photos";

/* The homepage: chapter order, and every chapter's words, photos and tone.
   Reorder chapterOrder, or hide a chapter by commenting it out. Colour hand-offs
   stay coherent automatically: each chapter receives the tone of the one above it. */

export const chapterOrder = [
  "hero",
  "register",
  "auditBureau",
  "selectedWork",
  "timeline",
  "craft",
  "designRoom",
  "drawing",
  "broadening",
  "showroom",
  "closing",
] as const;

export type ChapterName = (typeof chapterOrder)[number];

/* ── Ch.1 Hero ("Overture") ─────────────────────────────────────────── */
export const hero = {
  tone: "ink" as Tone,
  headline: {
    ar: "منذ ١٩٦٤، على طاولاتنا تُتَّخذ القرارات الكبرى.",
    en: "Since 1964, the decisions that matter have been made at our tables.",
  } as L,
  subline: { ar: "نجهّز المكان… لتبدأ الأفكار العظيمة.", en: "We prepare the space. Great ideas take it from there." } as L,
  primary: { label: { ar: "ابدأ مشروعك", en: "Start a project" } as L, href: "/start-a-project" },
  secondary: { label: { ar: "استكشف المشاريع", en: "Explore projects" } as L, href: "/projects" },
  verify: "Whose chamber this is (DSC00864–01403), and whether it may be shown. Shown unnamed." as Verify,

  /** The walk: a scroll-scrubbed frame sequence through three rooms they furnished, rebuilt in 3D.
      Frames live in public/hero/<desktop|phone>/ with a manifest.json each (see web/hero/README.md).
      verify: permission to show rebuilt, unnamed versions of the suite and the plenary chamber. */
  walk: {
    base: "/hero",
    /** Where each room label starts, as a fraction of the walk. Measured from the 24 Nov 2026 export
        (the brief's 0.5 / 0.74 were for an earlier cut). */
    rooms: [
      { from: 0, label: { ar: "مكتب معاصر", en: "Contemporary office" } as L },
      { from: 0.29, label: { ar: "مكتب تنفيذي", en: "Executive office" } as L },
      { from: 0.45, label: { ar: "قاعة الجلسات الكبرى", en: "Council chamber" } as L },
    ],
    /** The room labels leave before the end card arrives. */
    labelsOut: 0.88,
    /** The headline and buttons give way over the first 10% of the walk. */
    giveWay: 0.1,
    /** The navy wash behind the opening headline stays at full strength only for the first frames,
        then fades to a light strip so the rooms themselves are seen. */
    scrimFullUntil: 0.06,
    scrimFadedBy: 0.12,
    /** One line per building after the first, shown while the walk is in that room. */
    lines: [
      { from: 0.3, to: 0.41, text: { ar: "من مكتب تنفيذي.", en: "From an executive office." } as L },
      { from: 0.47, to: 0.79, text: { ar: "إلى مبنى كامل.", en: "To a whole building." } as L },
    ],
    /** From here, the end line and the button sit on the clear end wall. */
    endFrom: 0.92,
    endLine: { ar: "الغرفة التالية تبدأ بحديث.", en: "The next room starts with a conversation." } as L,
    smallPrint: {
      ar: "غرف أُعيد بناؤها ثلاثية الأبعاد من مشاريع أثّثناها.",
      en: "Rooms rebuilt in 3D from projects we furnished.",
    } as L,
    srText: {
      ar: "جولة في ثلاث غرف أثّثناها: مكتب معاصر بأريكة زرقاء، مكتب تنفيذي بجدار من الترافرتين، وقاعة جلسات كبرى.",
      en: "A walk through three rooms we furnished: a contemporary office with a blue sofa, an executive office with a travertine wall, and a large council chamber.",
    } as L,
  },
};

/* ── Ch.2 The Register ──────────────────────────────────────────────── */
export type RegisterName = { name: L; latin?: boolean; verify?: Verify };
export type RegisterGroup = { label: L; names: RegisterName[] };

export const register = {
  tone: "stone" as Tone,
  eyebrow: { ar: "سجلّ الثقة", en: "The register" } as L,
  headline: {
    ar: "اختارتنا الجهات التي لا تحتمل غرفُها التجربة.",
    en: "Chosen by organisations whose rooms leave no room for trial and error.",
  } as L,
  footnote: { ar: "قائمة مختارة.", en: "A selection." } as L,
  /** verify: permission to name each organisation publicly. */
  /** In register order: 8 government and energy/telecom names, then 6 finance, business, sport and culture. */
  groups: [
    {
      label: { ar: "جهات حكومية", en: "Government" },
      names: [
        { name: { ar: "وزارة المواصلات", en: "Ministry of Transport" } },
        { name: { ar: "ديوان المحاسبة الليبي", en: "Libyan Audit Bureau" } },
        { name: { ar: "هيئة الرقابة الإدارية", en: "Administrative Control Authority" } },
        { name: { ar: "هيئة الأمن والمرافق والمنشآت", en: "Security & Facilities Authority" } },
        { name: { ar: "بلدية الزاوية المركز", en: "Zawiya Centre Municipality" } },
      ],
    },
    {
      label: { ar: "الطاقة والاتصالات", en: "Energy & Telecom" },
      names: [
        { name: { ar: "المؤسسة الوطنية للنفط", en: "National Oil Corporation" } },
        { name: { ar: "ليبيانا", en: "Libyana" } },
        { name: { ar: "المدار الجديد", en: "Al-Madar Al-Jadeed" } },
      ],
    },
    {
      label: { ar: "المال والأعمال", en: "Finance & Business" },
      names: [
        { name: { ar: "مصرف الأندلس", en: "Andalus Bank" } },
        { name: { ar: "KIA Motors", en: "KIA Motors" }, latin: true },
        {
          name: { ar: "الصندوق الليبي للاستثمار الداخلي والتنمية", en: "Libyan Local Investment & Development Fund" },
          verify: "Seen in photos 05856–05980; not in copy deck v1.",
        },
        {
          name: { ar: "الخطوط الجوية الليبية المتحدة", en: "Libyan United Airlines" },
          verify: "Seen in photos 00045–00047; not in copy deck v1.",
        },
      ],
    },
    {
      label: { ar: "الرياضة والثقافة", en: "Sport & Culture" },
      names: [
        { name: { ar: "نادي الاتحاد", en: "Al-Ittihad Club" } },
        { name: { ar: "نادي السويحلي", en: "Al-Swehli Club" } },
      ],
    },
  ] as RegisterGroup[],
};

/* ── Ch.3 One building, told slowly (Libyan Audit Bureau) ───────────── */
export const auditBureau = {
  tone: "ink-deep" as Tone,
  lines: [
    { ar: "ديوان المحاسبة الليبي.", en: "The Libyan Audit Bureau." },
    { ar: "أحد عشر طابقاً.", en: "Eleven floors." },
    // The number is set from `area` and counts up; {n} marks where it sits.
    { ar: "{n} متر مربع.", en: "{n} square metres." },
    { ar: "شركة واحدة مسؤولة عن كل قطعة فيه.", en: "One company accountable for every piece in it." },
  ] as L[],
  area: 12500,
  floors: 11,
  closing: { ar: "من المخطط الأول إلى يوم التسليم.", en: "From the first floor plan to the day of handover." } as L,
  link: { label: { ar: "اقرأ قصة المشروع", en: "Read the project story" } as L, href: "/projects" },
  verify: "The full scope (all 11 floors furnished by Etihad Raeda?) and the year." as Verify,
};

/* ── Ch.4 Selected work ─────────────────────────────────────────────── */
export type Shape = "landscape" | "portrait" | "square" | "tall" | "panorama";

export const selectedWork = {
  tone: "stone" as Tone,
  headline: { ar: "أعمال مختارة", en: "Selected work" } as L,
  allLink: { label: { ar: "جميع المشاريع", en: "All projects" } as L, href: "/projects" },
  items: [
    {
      caption: { ar: "بلدية الزاوية المركز — قاعة المجلس البلدي", en: "Zawiya Centre Municipality — Council chamber" },
      photo: "zawiya",
      shape: "landscape",
      href: "/projects",
    },
    {
      caption: {
        ar: "متحف نادي الاتحاد — أول متحف لنادي كرة قدم في ليبيا، صمّمناه ونفّذناه.",
        en: "Al-Ittihad Club Museum — Libya's first football-club museum, designed and built by us.",
      },
      photo: "ittihad",
      shape: "portrait",
      href: "/projects",
      verify: "\"Designed and built\", both by Etihad Raeda?",
    },
    {
      caption: {
        ar: "بالتعاون مع مكتب ريديوس الهندسي — قاعات الاجتماعات ومساحات الاستقبال",
        en: "With Radius Design — meeting rooms and reception spaces",
      },
      photo: "radius",
      shape: "square",
      href: "/projects",
      verify: "Which project?",
    },
    {
      caption: { ar: "نادي السويحلي، مصراتة", en: "Al-Swehli Club, Misrata" },
      photo: "swehli",
      shape: "tall",
      href: "/projects",
    },
    {
      caption: { ar: "ليبيانا", en: "Libyana" },
      photo: "libyana",
      shape: "panorama",
      href: "/projects",
    },
  ] as { caption: L; photo: PhotoName; shape: Shape; href: string; verify?: Verify }[],
};

/* ── Ch.5 Six decades (timeline) ────────────────────────────────────── */
export type Milestone = { year: PendingText; text: PendingText; verify?: Verify };

export const timeline = {
  tone: "ink" as Tone,
  eyebrow: { ar: "منذ ١٩٦٤", en: "Since 1964" } as L,
  headline: { ar: "اثنان وستون عاماً، والمعيار لم يتغيّر.", en: "Sixty-two years. The standard hasn't moved." } as L,
  pendingTag: { ar: "بانتظار الشركة", en: "Client to supply" } as L,
  milestones: [
    {
      year: { ar: "١٩٦٤", en: "1964" },
      text: { ar: "المتجر الأول، شارع عمر المختار، طرابلس.", en: "The first store, Omar Al-Mukhtar Street, Tripoli." },
    },
    {
      year: { ar: "[السبعينيات–التسعينيات]", en: "[1970s–1990s]", pending: true },
      text: {
        ar: "[أول عقد حكومي / أول شراكة توريد — بانتظار الشركة]",
        en: "[First government contract / first import partnership — client to supply]",
        pending: true,
      },
    },
    {
      year: { ar: "[السنة]", en: "[year]", pending: true },
      text: { ar: "[افتتاح المصنع — بانتظار الشركة]", en: "[Factory opens — client to supply]", pending: true },
    },
    {
      year: { ar: "[السنة]", en: "[year]", pending: true },
      text: { ar: "صالة العرض في حي الأندلس.", en: "The Hay Al-Andalus showroom." },
    },
    {
      year: { ar: "٢٠٢٤", en: "2024" },
      text: { ar: "ليبيا بيلد ٢٠٢٤.", en: "Libya Build 2024." },
      verify: "Their role (exhibitor?).",
    },
    {
      year: { ar: "٢٠٢٦", en: "2026" },
      text: { ar: "بابٌ جديد، لمكاتب أصغر.", en: "A new door, for smaller offices." },
    },
  ] as Milestone[],
  /** The last panel: the present-day photo. verify: whose majlis it is. */
  endPhoto: "majlis" as PhotoName,
};

/* ── Ch.6 Materials & craft ─────────────────────────────────────────── */
export const craft = {
  tone: "stone" as Tone,
  line1: { ar: "الجودة لا تظهر في الصورة.", en: "Quality doesn't show in a photograph." } as L,
  line2: { ar: "تظهر بعد عشرين عاماً.", en: "It shows twenty years later." } as L,
  body: {
    ar: "نختار الخشب والجلد والحجر والأقمشة من مصنّعين متخصّصين حول العالم، ونفحص كل قطعة قبل أن تدخل مكاناً يحمل اسمك.",
    en: "We source wood, leather, stone and textiles from specialist manufacturers around the world, and inspect every piece before it enters a space that carries your name.",
  } as L,
  materials: [
    { label: { ar: "جوز", en: "Walnut" }, photo: "walnut" },
    { label: { ar: "رخام", en: "Marble" }, photo: "marble" },
    { label: { ar: "جلد", en: "Leather" }, photo: "leather" },
    { label: { ar: "نسيج", en: "Textile" }, photo: "textile" },
  ] as { label: L; photo: PhotoName }[],
  verify:
    "The inspection process, and the countries of origin (Europe / Malta? An LAS Mobili tag appears on DSC07516). If confirmed, add «من أوروبا إلى طرابلس.» / \"From Europe to Tripoli.\"" as Verify,
};

/* ── Ch.7 We design the room ────────────────────────────────────────── */
export const designRoom = {
  tone: "ink" as Tone,
  line1: { ar: "لا نبيع كرسياً.", en: "We don't sell chairs." } as L,
  line2: { ar: "نصمّم الغرفة.", en: "We design rooms." } as L,
  photo: "execSuite" as PhotoName,
  steps: [
    { title: { ar: "المعاينة", en: "Survey" }, text: { ar: "نزور المكان، نقيسه، ونفهم كيف تعمل.", en: "We visit, measure, and learn how you work." } },
    {
      title: { ar: "التصميم", en: "Design" },
      text: { ar: "مخططات وتصوّرات ثلاثية الأبعاد قبل أي التزام.", en: "Floor plans and 3D visuals before any commitment." },
    },
    {
      title: { ar: "التوريد والتصنيع", en: "Supply & make" },
      text: { ar: "من مصنعنا ومن شركائنا حول العالم.", en: "From our own factory and our partners abroad." },
    },
    {
      title: { ar: "التركيب وما بعده", en: "Install & after" },
      text: { ar: "فريقنا يركّب، ويبقى معك بعد التسليم.", en: "Our team installs, and stays with you after handover." },
    },
  ] as { title: L; text: L }[],
  verify: "Is 3D design before commitment free? After-sales and warranty terms? What does the factory make?" as Verify,
};

/* ── Ch.8 The drawing ───────────────────────────────────────────────── */
/* Not from the copy deck. All its wording needs the copywriter's review. */
export const drawing = {
  tone: "stone" as Tone,
  eyebrow: { ar: "من المعاينة إلى المخطط", en: "From survey to drawing" } as L,
  headline: { ar: "قبل أن تصل أي قطعة، تُرسم الغرفة.", en: "Before a single piece arrives, the room is drawn." } as L,
  intro: {
    ar: "جناح تنفيذي جهّزناه لجهة حكومية: مكتب، وقاعة اجتماعات لثمانية، ومكتب لمدير المكتب. هكذا يبدأ كل مشروع، على الورق.",
    en: "An executive suite we furnished for a government client: an office, a meeting room for eight, an office manager's room. Every project starts here, on paper.",
  } as L,
  steps: [
    { title: { ar: "المعاينة", en: "Survey" }, text: { ar: "نقيس الجدران كما هي، قبل أي اقتراح.", en: "We measure the walls as they are, before proposing anything." } },
    { title: { ar: "الفراغ", en: "The shell" }, text: { ar: "الجدران والأبواب والنوافذ، ومن أين يدخل الضوء.", en: "Walls, doors, windows, and where the light comes in." } },
    { title: { ar: "التأثيث", en: "Layout" }, text: { ar: "كل قطعة في مكانها، وكل ممرّ بينها محسوب.", en: "Every piece placed, every path between them kept clear." } },
    {
      title: { ar: "القياس", en: "Dimensions" },
      text: { ar: "مخطط نهائي بالمليمتر، يُعتمد قبل أن يُصنع أي شيء.", en: "A final drawing to the millimetre, signed off before anything is made." },
    },
  ] as { title: L; text: L }[],
  legend: [
    { ar: "جدار الترافرتين خلف المكتب", en: "Travertine wall behind the desk" },
    { ar: "طاولة اجتماعات لثمانية", en: "Meeting table for eight" },
    { ar: "ركن الجلوس", en: "The lounge corner" },
  ] as L[],
  smallPrint: {
    ar: "مخطط توضيحي أُعيد رسمه من صور المشروع، وليس رسماً هندسياً معتمداً.",
    en: "Indicative plan, redrawn from the project photographs; not a survey drawing.",
  } as L,
  planLabel: {
    ar: "مخطط أرضي لجناح تنفيذي: مكتب، وقاعة اجتماعات، ومكتب مدير، واستقبال.",
    en: "Floor plan of an executive suite: office, meeting room, office manager's room and reception.",
  } as L,
  verify: "Ask for the real CAD plan of the executive suite (DSC07444–07522) and permission to show it. Confirm \"a government client\"." as Verify,
};

/* ── Ch.9 For your office (the consumer line) ───────────────────────── */
export type Collection = { code: string; name: L; waName: L; line: L; photo: PhotoName };

export const broadening = {
  tone: "stone-deep" as Tone,
  from: "execSuite" as PhotoName,
  to: "smallOffice" as PhotoName,
  eyebrow: { ar: "لمكتبك", en: "For your office" } as L,
  headline: {
    ar: "المعيار الذي نبني به للوزارات، بمقاس مكتبك.",
    en: "The standard we build to for ministries, sized for your office.",
  } as L,
  body: {
    ar: "للعيادة، ومكتب المحاماة، والشركة الناشئة، وغرفة العمل في البيت. مجموعات مختارة بعناية، تحمل توقيعنا نفسه.",
    en: "For the clinic, the law practice, the young company and the study at home. Carefully chosen collections, carrying the same signature.",
  } as L,
  link: { label: { ar: "اكتشف المجموعات", en: "Discover the collections" } as L, href: "/your-office" },
  whatsappLabel: { ar: "اسأل عن السعر عبر واتساب", en: "Ask for the price on WhatsApp" } as L,
  /** verify: the WhatsApp working hours. */
  note: { ar: "نردّ خلال ساعات العمل، من الأحد إلى الخميس.", en: "We reply during working hours, Sunday to Thursday." } as L,
  /** Codes are placeholders. verify: the consumer line name and the product codes. */
  collections: [
    {
      code: "ER-EX-01",
      name: { ar: "التنفيذي", en: "Executive" },
      waName: { ar: "مجموعة التنفيذي", en: "the Executive collection" },
      line: { ar: "حضور هادئ لمن يتخذ القرار.", en: "A quiet presence for the one who decides." },
      photo: "collExecutive",
    },
    {
      code: "ER-WS-01",
      name: { ar: "محطات العمل", en: "Workstations" },
      waName: { ar: "مجموعة محطات العمل", en: "the Workstations collection" },
      line: { ar: "ترتيب يُريح العين ويُطيل التركيز.", en: "Order that rests the eye and holds focus." },
      photo: "collWorkstations",
    },
    {
      code: "ER-LA-01",
      name: { ar: "الاستراحة والعزل الصوتي", en: "Lounge & Acoustic" },
      waName: { ar: "مجموعة الاستراحة والعزل الصوتي", en: "the Lounge & Acoustic collection" },
      line: { ar: "مساحة للتفكير وسط الضجيج.", en: "Room to think amid the noise." },
      photo: "collLounge",
    },
  ] as Collection[],
  /** The reserved 3D-chair slot (§16). Files live in public/chair/. */
  chair: {
    headline: { ar: "الجودة تُرى، لا تُقال.", en: "Quality is seen, not said." } as L,
    label: {
      ar: "كرسي «تب» بقماش بيج، أُعيد بناؤه ثلاثي الأبعاد من صورة المرجع.",
      en: "The beige tub chair, rebuilt in 3D from the reference photograph.",
    } as L,
  },
};

/* ── Ch.10 Showroom ─────────────────────────────────────────────────── */
export const showroom = {
  tone: "stone" as Tone,
  photo: "storefront" as PhotoName,
  headline: { ar: "لنجد ما يناسب مساحتك", en: "Come and sit." } as L,
  body: {
    ar: "الأثاث الجيد يُختار باللمس. زُرنا في صالة العرض بحي الأندلس، طرابلس.",
    en: "Good furniture is chosen by touch. Visit our showroom in Hay Al-Andalus, Tripoli.",
  } as L,
  details: [
    { ar: "[ساعات العمل]", en: "[hours]", pending: true, verify: "Opening hours." },
    { ar: "قرب جامع الشريف", en: "Near Al-Sharif Mosque" },
  ] as PendingText[],
  directions: { ar: "احصل على الاتجاهات", en: "Get directions" } as L,
  mapTag: { ar: "خريطة صالة العرض · بانتظار الموقع الدقيق", en: "Showroom map · exact pin pending" } as L,
  verify: "Whether the new storefront is separate from Hay Al-Andalus; the exact pin." as Verify,
};

/* ── Ch.11 Closing chord ────────────────────────────────────────────── */
export const closing = {
  tone: "ink" as Tone,
  headline: { ar: "نجهّز المكان… لتبدأ الأفكار العظيمة.", en: "We prepare the space. Great ideas take it from there." } as L,
  primary: { label: { ar: "ابدأ مشروعك", en: "Start a project" } as L, href: "/start-a-project" },
  whatsappLabel: { ar: "لمكتبك: تواصل عبر واتساب", en: "For your office: message us on WhatsApp" } as L,
};

export const chapterTones: Record<ChapterName, Tone> = {
  hero: hero.tone,
  register: register.tone,
  auditBureau: auditBureau.tone,
  selectedWork: selectedWork.tone,
  timeline: timeline.tone,
  craft: craft.tone,
  designRoom: designRoom.tone,
  drawing: drawing.tone,
  broadening: broadening.tone,
  showroom: showroom.tone,
  closing: closing.tone,
};
