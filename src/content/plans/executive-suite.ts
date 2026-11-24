import type { L } from "../types";

/* The floor plan for Ch.8 "The drawing". All millimetres, origin top-left, x right, y down.
   A rectangle is [x, y, width, height]. Redrawn from the project photographs; not a survey drawing.
   verify: ask the client for the real CAD plan (DSC07444–07522) and permission to show it. */

export type Rect = [number, number, number, number];
export type Pt = [number, number];
export type Dir = "north" | "south" | "east" | "west";

export const OUT = 250;
export const IN = 120;

export const suite = { width: 14000, depth: 9000 };
/** viewBox padding around the suite. */
export const pad = { side: 1500, top: 1900, bottom: 2100 };

export const walls = {
  /** Outside walls, already split where the openings are. Drawn first. */
  outer: [
    // North
    [0, 0, 1300, 250], [3300, 0, 1100, 250], [6900, 0, 2400, 250], [12600, 0, 1400, 250],
    // East
    [13750, 250, 250, 1050], [13750, 3700, 250, 2000], [13750, 6700, 250, 2050],
    // South
    [0, 8750, 1200, 250], [3600, 8750, 2700, 250], [8300, 8750, 700, 250], [10600, 8750, 3400, 250],
    // West (the travertine wall is on its inside face)
    [0, 250, 250, 6550], [0, 8000, 250, 750],
  ] as Rect[],
  inner: [
    // office | meeting room
    [7940, 250, 120, 2950], [7940, 4600, 120, 1460],
    // meeting room | reception
    [8060, 4940, 940, 120], [9900, 4940, 3850, 120],
    // office | manager
    [250, 5940, 3350, 120], [4500, 5940, 3440, 120],
    // private WC
    [6540, 4340, 1400, 120], [6540, 4460, 120, 240], [6540, 5450, 120, 490],
    // manager | reception
    [5440, 6060, 120, 940], [5440, 7900, 120, 850],
    // lift shaft
    [12340, 7140, 1410, 120], [12340, 7260, 120, 340], [12340, 8400, 120, 350],
  ] as Rect[],
};

export const windows: Rect[] = [
  [1300, 0, 2000, 250], [4400, 0, 2500, 250], [9300, 0, 3300, 250],
  [13750, 1300, 250, 2400], [13750, 5700, 250, 1000],
  [1200, 8750, 2400, 250], [6300, 8750, 2000, 250], [0, 6800, 250, 1200],
];

/** hinge, leaf width, direction when open, direction when closed. */
export type Door = { hinge: Pt; leaf: number; open: Dir; closed: Dir };

export const doors: Door[] = [
  // office → meeting room (double)
  { hinge: [8060, 3200], leaf: 700, open: "east", closed: "south" },
  { hinge: [8060, 4600], leaf: 700, open: "east", closed: "north" },
  // meeting room → reception
  { hinge: [9900, 5060], leaf: 900, open: "south", closed: "west" },
  // office → manager
  { hinge: [3600, 6060], leaf: 900, open: "south", closed: "east" },
  // private WC
  { hinge: [6540, 4700], leaf: 750, open: "west", closed: "south" },
  // manager → reception
  { hinge: [5560, 7000], leaf: 900, open: "east", closed: "south" },
  // main entrance (double)
  { hinge: [9000, 8750], leaf: 800, open: "north", closed: "east" },
  { hinge: [10600, 8750], leaf: 800, open: "north", closed: "west" },
];

export const fixtures = {
  lift: [12560, 7360, 1090, 1290] as Rect,
  liftDoor: [[12340, 7600], [12340, 8400]] as [Pt, Pt],
  steps: { rect: [8800, 9000, 2000, 900] as Rect, lines: [9300, 9600], x: [8800, 10800] as [number, number] },
};

export type Shape =
  | { kind: "rect"; r: Rect; radius?: number; hatch?: boolean; dividers?: { x?: number[] } }
  | { kind: "circle"; c: Pt; radius: number }
  | { kind: "chair"; seat: Rect; back: Dir };

export type RoomName = "office" | "meeting" | "manager" | "reception" | "wc";

export const furniture: { room: RoomName; shapes: Shape[] }[] = [
  {
    room: "office",
    shapes: [
      { kind: "rect", r: [250, 700, 180, 4600], hatch: true }, // travertine cladding
      { kind: "rect", r: [1300, 2000, 1000, 2400], radius: 40 }, // executive desk
      { kind: "rect", r: [1400, 2150, 800, 2100], radius: 20 }, // leather top
      { kind: "rect", r: [700, 5420, 3000, 450], radius: 20, dividers: { x: [1700, 2700] } }, // credenza
      { kind: "rect", r: [4000, 600, 3300, 3300], radius: 60 }, // lounge rug
      { kind: "rect", r: [4300, 450, 2400, 800], radius: 120, dividers: { x: [5100, 5900] } }, // sofa
      { kind: "rect", r: [4900, 1750, 1200, 700], radius: 60 }, // coffee table
      { kind: "circle", c: [7450, 750], radius: 260 }, // plant
      { kind: "chair", seat: [650, 2950, 520, 520], back: "west" }, // executive chair
      { kind: "chair", seat: [2650, 2350, 480, 500], back: "east" },
      { kind: "chair", seat: [2650, 3550, 480, 500], back: "east" },
      { kind: "chair", seat: [4500, 2950, 800, 750], back: "south" },
      { kind: "chair", seat: [5700, 2950, 800, 750], back: "south" },
    ],
  },
  {
    room: "meeting",
    shapes: [
      { kind: "rect", r: [9300, 1900, 3600, 1400], radius: 600 }, // table for eight
      { kind: "rect", r: [13560, 1700, 80, 1800] }, // wall screen
      { kind: "circle", c: [8500, 700], radius: 240 },
      { kind: "chair", seat: [9650, 1250, 500, 480], back: "north" },
      { kind: "chair", seat: [10850, 1250, 500, 480], back: "north" },
      { kind: "chair", seat: [12050, 1250, 500, 480], back: "north" },
      { kind: "chair", seat: [9650, 3470, 500, 480], back: "south" },
      { kind: "chair", seat: [10850, 3470, 500, 480], back: "south" },
      { kind: "chair", seat: [12050, 3470, 500, 480], back: "south" },
      { kind: "chair", seat: [8600, 2360, 480, 500], back: "west" },
      { kind: "chair", seat: [13120, 2360, 480, 500], back: "east" },
    ],
  },
  {
    room: "manager",
    shapes: [
      { kind: "rect", r: [800, 6450, 2000, 750], radius: 30 },
      { kind: "rect", r: [2900, 8050, 2200, 600], radius: 100 },
      { kind: "circle", c: [5150, 6400], radius: 230 },
      { kind: "chair", seat: [1550, 7350, 500, 480], back: "south" },
      { kind: "chair", seat: [3500, 6700, 520, 500], back: "east" },
    ],
  },
  {
    room: "reception",
    shapes: [
      { kind: "rect", r: [5900, 6250, 1800, 500], radius: 40 },
      { kind: "circle", c: [12150, 5850], radius: 220 },
      { kind: "circle", c: [6050, 8350], radius: 260 },
      { kind: "chair", seat: [11200, 5450, 700, 750], back: "north" },
      { kind: "chair", seat: [12400, 5450, 700, 750], back: "north" },
    ],
  },
  {
    room: "wc",
    shapes: [
      { kind: "rect", r: [7700, 5000, 180, 480] }, // cistern
      { kind: "rect", r: [7240, 5040, 460, 400], radius: 180 }, // bowl
      { kind: "rect", r: [6800, 5600, 520, 280], radius: 100 }, // basin
    ],
  },
];

/** Chair backs: a 110-thick band on the given side, inset 30 from the seat's ends. */
export const chairSpec = { back: 110, inset: 30, seatRadius: 90, backRadius: 40 };

export const rooms: { id: RoomName; name: L; at: Pt; area: Rect }[] = [
  { id: "office", name: { ar: "المكتب التنفيذي", en: "Executive office" }, at: [4300, 4850], area: [250, 250, 7690, 5690] },
  { id: "meeting", name: { ar: "قاعة الاجتماعات", en: "Meeting room" }, at: [11100, 4450], area: [8060, 250, 5690, 4690] },
  { id: "manager", name: { ar: "مدير المكتب", en: "Office manager" }, at: [3700, 7650], area: [250, 6060, 5190, 2690] },
  { id: "reception", name: { ar: "الاستقبال", en: "Reception" }, at: [9200, 7300], area: [5560, 6060, 8190, 2690] },
  { id: "wc", name: { ar: "دورة مياه", en: "WC" }, at: [7270, 4800], area: [6660, 4460, 1280, 1480] },
];

export const areaUnit: L = { ar: "م²", en: "m²" };
/** The area figure sits this far below the room name. */
export const areaOffset = 330;

/** side, distance from the wall, measured points. */
export const dimensions: { side: "top" | "bottom" | "left" | "right"; offset: number; points: number[] }[] = [
  { side: "top", offset: 1350, points: [0, 14000] },
  { side: "top", offset: 750, points: [0, 8000, 14000] },
  { side: "left", offset: 750, points: [0, 6000, 9000] },
  { side: "right", offset: 750, points: [0, 5000, 9000] },
  { side: "bottom", offset: 1500, points: [0, 5500, 14000] },
];

/** 600 mm gold squares with ink numbers; they match the legend under the drawing. */
export const markers: Pt[] = [
  [340, 3000], // 01 the travertine wall
  [11100, 2600], // 02 the meeting table
  [5500, 2100], // 03 the lounge
];
export const markerSize = 600;
export const penSize = 260;

/** The pen's path, one list per step. */
export const penPath: Pt[][] = [
  [[0, 0], [14000, 0], [14000, 9000], [0, 9000]],
  [[8000, 3900], [9450, 5000], [9800, 8750]],
  [[1800, 3200], [11100, 2600], [1900, 6900], [12000, 5800]],
  [[340, 3000], [11100, 2600], [5500, 2100]],
];

export const textSizes = { room: 400, area: 300, dim: 250 };
export const hatch = { spacing: 140, stroke: 14, opacity: 0.4 };
