/** A 22×10 line with a chevron. Points forward in both directions (mirrored in RTL). */
export function Arrow({ back = false, className = "" }: { back?: boolean; className?: string }) {
  return (
    <svg
      className={`${back ? "arrow-back" : "arrow"} ${className}`}
      width="22"
      height="10"
      viewBox="0 0 22 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 5h20.5M16.5 1l4 4-4 4" />
    </svg>
  );
}
