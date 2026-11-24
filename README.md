# Etihad Raeda Office Furniture — website

Built from `website-rebuild-brief final.md`. Arabic first at `/`, English at `/en`.

## Run

```bash
npm run dev      # port 3100 (the Claude preview uses 3110)
npm run check    # tsc + eslint → "All good: no problems found."
npm run build
```

Add `?motion=reduce` to any address for the still version (no intro, no smooth scroll, everything visible).

## Where to edit (no code needed)

| What | File |
|---|---|
| Brand, menu, phones, emails, address, WhatsApp, socials, footer | `src/content/global.ts` |
| Homepage words, photos, tones, chapter order | `src/content/pages/home.ts` |
| The "Start a project" form (steps, options, messages) | `src/content/pages/start-a-project.ts` |
| Holding pages and 404 | `src/content/pages/holding-pages.ts` |
| Photo library (add `src` when a real file arrives) | `src/content/photos.ts` + `public/photos/` |
| Hero walk words and timings (room labels, give-way, end card) | `src/content/pages/home.ts` → `hero.walk` |
| Hero walk frames (AVIF + WebP, manifest per variant) | `public/hero/` (see `../web/hero/README.md`) |
| Floor plan (millimetres) | `src/content/plans/executive-suite.ts` |
| Colours, type scale, spacing, intro timing | `src/design/tokens.css` |
| Motion speed, switches, eases, durations | `src/design/motion.ts` |

Lines with `verify:` are claims the client still has to confirm. They are never shown on the site.

## Not built yet

Real photos (the hero is now the 3D walk), the real section pages, the form backend (Resend, Odoo, Turnstile, Cal.com), SEO structured data and redirects. See §16 of the brief.
