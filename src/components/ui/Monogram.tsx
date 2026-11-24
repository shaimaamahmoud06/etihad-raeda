/* The ER monogram, redrawn as strokes from the client's brand book ("new logo", Etihad Raeda-B.pdf).
   The open frame and middle bar form the E; the stem makes the cross; the chair in profile forms the R.
   pathLength=1 on every path so the line-draw works. Never mirrored.
   If the client supplies a master stroke SVG, swap the paths here and keep pathLength=1. */

export const MONOGRAM_PATHS = [
  /* frame: bottom arm, spine, top, right side down to the bar */ "M38.4 94H5V5H95V61",
  /* middle bar */ "M5 61H95",
  /* stem */ "M38.8 17.9V82.3",
  /* chair back and back leg */ "M76.6 23.4L78.4 44.25L94.37 92.7",
  /* seat and front leg */ "M78.4 44.25H55.6L48.9 65.1",
];

type Props = {
  size?: number | string;
  strokeWidth?: number;
  /** Colour of the frame; the other strokes use the current colour. */
  frameColor?: string;
  /** Draw the strokes in when scrolled into view (data-draw preset). */
  draw?: boolean;
  className?: string;
  title?: string;
};

export function Monogram({ size = 48, strokeWidth = 2.6, frameColor = "var(--c-gold)", draw = false, className = "", title }: Props) {
  return (
    <svg
      className={`monogram ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      strokeMiterlimit={10}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
      focusable="false"
      {...(draw ? { "data-draw": "" } : {})}
    >
      {MONOGRAM_PATHS.map((d, i) => (
        <path key={i} d={d} pathLength={1} stroke={i === 0 ? frameColor : undefined} />
      ))}
    </svg>
  );
}
