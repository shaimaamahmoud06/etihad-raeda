import Image from "next/image";
import { labels } from "@/content/global";
import { photos, type PhotoName } from "@/content/photos";
import type { Locale } from "@/content/types";

/* One frame per real photograph (§4.8). With a file: next/image, cover.
   Without one: a labelled placeholder in a colour mood sampled from the real photo. */

export type LabelPos = "bottom" | "top" | "top-start" | "top-end";

type Props = {
  name: PhotoName;
  locale: Locale;
  className?: string;
  /** Opens from the centre when scrolled into view. On by default. */
  curtain?: boolean;
  /** The image layer drifts inside the frame as you scroll. */
  parallax?: boolean;
  priority?: boolean;
  sizes?: string;
  labelPos?: LabelPos;
  /** Extra attributes for the frame (e.g. a chapter's own data hooks). */
  frameProps?: Record<string, string>;
};

export function PhotoSlot({
  name,
  locale,
  className = "",
  curtain = true,
  parallax = false,
  priority = false,
  sizes = "100vw",
  labelPos = "bottom",
  frameProps = {},
}: Props) {
  const p = photos[name] as (typeof photos)[PhotoName] & { src?: string };
  const subject = p.subject[locale];
  const status = p.status === "transfer" ? labels.photoPending[locale] : labels.photoNone[locale];
  const placeholder = !p.src;
  const srLabel = [status, p.dsc, subject].filter(Boolean).join(" — ");

  return (
    <figure
      className={`photo ${p.mood === "stone" ? "is-stone" : ""} ${className}`}
      {...(curtain ? { "data-curtain": "" } : {})}
      {...(parallax ? { "data-parallax": "" } : {})}
      {...(placeholder ? { role: "img", "aria-label": srLabel } : {})}
      {...frameProps}
    >
      <div className="photo-media" data-photo-media="">
        {p.src ? (
          <Image src={p.src} alt={subject} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />
        ) : (
          <div className={`photo-placeholder mood-${p.mood}`} />
        )}
      </div>
      {placeholder && (
        <>
          <div className="photo-frame" aria-hidden="true" />
          <figcaption className="photo-label" data-pos={labelPos} aria-hidden="true">
            <span className="photo-status">
              <span className="photo-dot" {...(p.status === "none" ? { "data-hollow": "" } : {})} />
              {status}
            </span>
            <span className="photo-subject">
              {p.dsc && (
                <>
                  <span className="photo-dsc ltr">{p.dsc}</span>
                  {" — "}
                </>
              )}
              {subject}
            </span>
          </figcaption>
        </>
      )}
    </figure>
  );
}
