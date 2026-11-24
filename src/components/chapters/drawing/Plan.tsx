import * as P from "@/content/plans/executive-suite";
import type { Locale } from "@/content/types";
import { planFigure, twoDigit } from "@/lib/format";

/* The executive-suite floor plan, drawn from millimetre data (§12). Always left-to-right.
   Strokes use drawing units set per screen (--plan-stroke) so they stay about one pixel thin.
   Every drawable path carries pathLength=1 so the scroll can draw it. */

type Rect = P.Rect;

const n = (v: number) => Math.round(v * 10) / 10;

function rectPath([x, y, w, h]: Rect, radius = 0): string {
  const r = Math.min(radius, w / 2, h / 2);
  if (!r) return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
  return [
    `M${x + r} ${y}H${x + w - r}`,
    `A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}`,
    `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}`,
    `A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}`,
    `A${r} ${r} 0 0 1 ${x + r} ${y}Z`,
  ].join("");
}

function circlePath([cx, cy]: P.Pt, r: number): string {
  return `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
}

const DIR: Record<P.Dir, P.Pt> = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };

function chairPaths(seat: Rect, back: P.Dir): string[] {
  const [x, y, w, h] = seat;
  const { back: b, inset: i, seatRadius, backRadius } = P.chairSpec;
  const band: Rect =
    back === "west"
      ? [x, y + i, b, h - 2 * i]
      : back === "east"
        ? [x + w - b, y + i, b, h - 2 * i]
        : back === "north"
          ? [x + i, y, w - 2 * i, b]
          : [x + i, y + h - b, w - 2 * i, b];
  return [rectPath(seat, seatRadius), rectPath(band, backRadius)];
}

function shapePaths(s: P.Shape): string[] {
  if (s.kind === "circle") return [circlePath(s.c, s.radius)];
  if (s.kind === "chair") return chairPaths(s.seat, s.back);
  const out = [rectPath(s.r, s.radius ?? 0)];
  const [, y, , h] = s.r;
  for (const dx of s.dividers?.x ?? []) out.push(`M${dx} ${y}V${y + h}`);
  return out;
}

function windowPath([x, y, w, h]: Rect): string {
  if (w >= h) {
    return `M${x} ${y}H${x + w}M${x} ${y + h / 2}H${x + w}M${x} ${y + h}H${x + w}M${x} ${y}V${y + h}M${x + w} ${y}V${y + h}`;
  }
  return `M${x} ${y}V${y + h}M${x + w / 2} ${y}V${y + h}M${x + w} ${y}V${y + h}M${x} ${y}H${x + w}M${x} ${y + h}H${x + w}`;
}

function doorPaths(d: P.Door): { leaf: string; arc: string } {
  const [hx, hy] = d.hinge;
  const o = DIR[d.open];
  const c = DIR[d.closed];
  const ox = hx + o[0] * d.leaf;
  const oy = hy + o[1] * d.leaf;
  const cx = hx + c[0] * d.leaf;
  const cy = hy + c[1] * d.leaf;
  const a0 = Math.atan2(oy - hy, ox - hx);
  const a1 = Math.atan2(cy - hy, cx - hx);
  let delta = a1 - a0;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  const sweep = delta > 0 ? 1 : 0;
  return { leaf: `M${hx} ${hy}L${ox} ${oy}`, arc: `M${ox} ${oy}A${d.leaf} ${d.leaf} 0 0 ${sweep} ${cx} ${cy}` };
}

function hatchPath([x, y, w, h]: Rect, spacing: number): string {
  const parts: string[] = [];
  for (let c = x - h; c < x + w; c += spacing) parts.push(`M${c} ${y + h}L${c + h} ${y}`);
  return parts.join("");
}

type Fig = { x: number; y: number; text: string; rotate?: boolean };

function dimChain(chain: (typeof P.dimensions)[number], locale: Locale) {
  const { width: W, depth: D } = P.suite;
  const t = 100; // tick half-size
  const gap = 200; // gap between the building and the extension lines
  const over = 150; // extension past the dimension line
  const pts = chain.points;
  const figs: Fig[] = [];
  let line = "";
  let ext = "";
  const horizontal = chain.side === "top" || chain.side === "bottom";
  if (horizontal) {
    const y = chain.side === "top" ? -chain.offset : D + chain.offset;
    const wallY = chain.side === "top" ? -gap : D + gap;
    const outY = chain.side === "top" ? y - over : y + over;
    line = `M${pts[0]} ${y}H${pts[pts.length - 1]}`;
    for (const p of pts) {
      line += `M${p - t} ${y + t}L${p + t} ${y - t}`;
      ext += `M${p} ${wallY}V${outY}`;
    }
    for (let i = 0; i < pts.length - 1; i++) figs.push({ x: (pts[i] + pts[i + 1]) / 2, y: y - 120, text: planFigure(pts[i + 1] - pts[i], locale) });
  } else {
    const x = chain.side === "left" ? -chain.offset : W + chain.offset;
    const wallX = chain.side === "left" ? -gap : W + gap;
    const outX = chain.side === "left" ? x - over : x + over;
    line = `M${x} ${pts[0]}V${pts[pts.length - 1]}`;
    for (const p of pts) {
      line += `M${x - t} ${p + t}L${x + t} ${p - t}`;
      ext += `M${wallX} ${p}H${outX}`;
    }
    for (let i = 0; i < pts.length - 1; i++)
      figs.push({ x: x - 120, y: (pts[i] + pts[i + 1]) / 2, text: planFigure(pts[i + 1] - pts[i], locale), rotate: true });
  }
  return { line, ext, figs };
}

export function Plan({ locale, label }: { locale: Locale; label: string }) {
  const { width: W, depth: D } = P.suite;
  const vb = [-P.pad.side, -P.pad.top, W + 2 * P.pad.side, D + P.pad.top + P.pad.bottom];
  const travertine = P.furniture[0].shapes.find((s) => s.kind === "rect" && s.hatch) as { r: Rect } | undefined;
  const dims = P.dimensions.map((c) => dimChain(c, locale));
  const pen0 = P.penPath[0][0];
  const half = P.penSize / 2;
  const dimSize = P.textSizes.dim * 0.85;

  return (
    <svg
      data-plan=""
      className="plan block w-full"
      viewBox={vb.join(" ")}
      style={{ direction: "ltr" }}
      role="img"
      aria-label={label}
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
    >
      <defs>
        {travertine && (
          <clipPath id="travertine-clip">
            <path d={rectPath(travertine.r)} />
          </clipPath>
        )}
      </defs>

      {/* Travertine hatch */}
      {travertine && (
        <g data-plan-hatch="" opacity={P.hatch.opacity} clipPath="url(#travertine-clip)">
          <path d={hatchPath(travertine.r, P.hatch.spacing)} strokeWidth={P.hatch.stroke} />
        </g>
      )}

      {/* Furniture, room by room */}
      {P.furniture.map((room) => (
        <g key={room.room} data-plan-room={room.room} opacity={0.5}>
          {room.shapes.flatMap((s, i) => shapePaths(s).map((d, j) => <path key={`${i}-${j}`} d={d} pathLength={1} data-plan-path="" />))}
        </g>
      ))}

      {/* Details: windows, door leaves, door arcs, lift, lift door, entrance steps */}
      <g>
        {P.windows.map((w, i) => (
          <path key={`w${i}`} d={windowPath(w)} pathLength={1} data-plan-detail="" opacity={0.6} />
        ))}
        {P.doors.map((d, i) => {
          const p = doorPaths(d);
          return (
            <g key={`d${i}`}>
              <path d={p.leaf} pathLength={1} data-plan-detail="" opacity={0.6} />
              <path d={p.arc} pathLength={1} data-plan-detail="" opacity={0.35} />
            </g>
          );
        })}
        <path
          d={`${rectPath(P.fixtures.lift)}M${P.fixtures.lift[0]} ${P.fixtures.lift[1]}l${P.fixtures.lift[2]} ${P.fixtures.lift[3]}M${P.fixtures.lift[0] + P.fixtures.lift[2]} ${P.fixtures.lift[1]}l${-P.fixtures.lift[2]} ${P.fixtures.lift[3]}`}
          pathLength={1}
          data-plan-detail=""
          opacity={0.6}
        />
        <path
          d={`M${P.fixtures.liftDoor[0][0]} ${P.fixtures.liftDoor[0][1]}L${P.fixtures.liftDoor[1][0]} ${P.fixtures.liftDoor[1][1]}`}
          pathLength={1}
          data-plan-detail=""
          opacity={0.6}
        />
        <path
          d={`${rectPath(P.fixtures.steps.rect)}${P.fixtures.steps.lines.map((y) => `M${P.fixtures.steps.x[0]} ${y}H${P.fixtures.steps.x[1]}`).join("")}`}
          pathLength={1}
          data-plan-detail=""
          opacity={0.6}
        />
      </g>

      {/* Walls: solid filled rectangles (outline first, then fill) */}
      <g className="plan-walls">
        {P.walls.outer.map((r, i) => (
          <path key={`o${i}`} d={rectPath(r)} pathLength={1} data-plan-wall="outer" fill="currentColor" />
        ))}
        {P.walls.inner.map((r, i) => (
          <path key={`i${i}`} d={rectPath(r)} pathLength={1} data-plan-wall="inner" fill="currentColor" />
        ))}
      </g>

      {/* Dimension chains */}
      <g>
        {dims.map((c, i) => (
          <g key={i}>
            <path d={c.ext} pathLength={1} data-plan-dimline="" opacity={0.22} />
            <path d={c.line} pathLength={1} data-plan-dimline="" opacity={0.45} />
          </g>
        ))}
      </g>
      <g fill="currentColor" stroke="none" className="plan-text" fontSize={dimSize}>
        {dims.flatMap((c, i) =>
          c.figs.map((f, j) => (
            <text
              key={`${i}-${j}`}
              data-plan-fig=""
              x={n(f.x)}
              y={n(f.y)}
              textAnchor="middle"
              opacity={0.6}
              transform={f.rotate ? `rotate(-90 ${n(f.x)} ${n(f.y)})` : undefined}
            >
              {f.text}
            </text>
          )),
        )}
      </g>

      {/* Room names and areas */}
      <g fill="currentColor" stroke="none" className="plan-text plan-rooms">
        {P.rooms.map((r) => {
          const area = Math.round((r.area[2] * r.area[3]) / 1e6);
          return (
            <g key={r.id}>
              <text data-plan-label="" x={r.at[0]} y={r.at[1]} textAnchor="middle" fontSize={P.textSizes.room} opacity={0.85} className="plan-room-name">
                {r.name[locale]}
              </text>
              <text data-plan-label="" x={r.at[0]} y={r.at[1] + P.areaOffset + P.textSizes.area * 0.4} textAnchor="middle" fontSize={P.textSizes.area} opacity={0.6}>
                {planFigure(area, locale)} {P.areaUnit[locale]}
              </text>
            </g>
          );
        })}
      </g>

      {/* Numbered markers */}
      {P.markers.map(([x, y], i) => (
        <g key={i} data-plan-marker="" className="plan-marker">
          <rect x={x - P.markerSize / 2} y={y - P.markerSize / 2} width={P.markerSize} height={P.markerSize} fill="var(--c-gold)" stroke="none" />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={300} fill="var(--c-ink)" stroke="none" className="plan-text">
            {twoDigit(i + 1, locale)}
          </text>
        </g>
      ))}

      {/* The pen (motion only) */}
      <rect data-plan-pen="" className="plan-pen" x={pen0[0] - half} y={pen0[1] - half} width={P.penSize} height={P.penSize} fill="var(--c-gold)" stroke="none" />
    </svg>
  );
}
