import type { ElementType, ReactNode } from "react";

/* Splits a headline into words on the server. Each word is an inline-block span; spaces
   stay real text so lines wrap; Arabic letters inside a word stay joined. */

const YEAR = /^(١٩٦٤|1964)([،,.]?)$/;

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Wrap the founding year for the gold accent. "sheen" also gives it the hero sheen. */
  accentYear?: boolean | "sheen";
  /** "" lets the shared preset animate it; "manual" means the chapter does. */
  mode?: "" | "manual" | false;
  lang?: string;
};

export function SplitWords({ text, as: Tag = "span", className = "", id, accentYear = false, mode = "", lang }: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  const out: ReactNode[] = [];
  words.forEach((w, i) => {
    const m = accentYear ? w.match(YEAR) : null;
    out.push(
      <span data-word="" key={i}>
        {m ? (
          <>
            <span className={accentYear === "sheen" ? "hero-year num" : "year num"}>{m[1]}</span>
            {m[2]}
          </>
        ) : (
          w
        )}
      </span>,
    );
    if (i < words.length - 1) out.push(" ");
  });
  const attrs = mode === false ? {} : { "data-words": mode };
  return (
    <Tag id={id} className={className} lang={lang} {...attrs}>
      {out}
    </Tag>
  );
}
