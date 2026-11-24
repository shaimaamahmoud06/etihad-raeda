"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { brand, labels, menu } from "@/content/global";
import type { Locale } from "@/content/types";
import { effects } from "@/design/motion";
import { twoDigit } from "@/lib/format";
import { getLenis } from "@/motion/lenis-store";
import { Monogram } from "@/components/ui/Monogram";

/* The header (§6.4). Transparent only on the homepage, at the very top, while the menu is
   closed and the first chapter is dark. Solid after 24 px, on every other page, and while
   the menu is open. Tucks away when scrolling down past 240 px; returns on scroll up or focus. */

type Props = { locale: Locale; firstChapterDark: boolean };

export function Header({ locale, firstChapterDark }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const other: Locale = locale === "ar" ? "en" : "ar";

  // Scroll: solid state, tuck, reading progress. Updated once per animation frame.
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const canTuck = () =>
      effects.headerAutoHide &&
      !openRef.current &&
      !document.documentElement.classList.contains("force-reduce") &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !headerRef.current?.contains(document.activeElement);

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      const delta = y - last;
      if (y <= 240) {
        setTucked(false);
        last = y;
      } else if (delta > 6) {
        if (canTuck()) setTucked(true);
        last = y;
      } else if (delta < -6) {
        setTucked(false);
        last = y;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  // Close on any page change.
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // While open: lock scrolling, focus the first link, trap Tab, close on Escape.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    getLenis()?.stop();
    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const items = Array.from(sheet.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (!items.length) return;
      const first = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = "";
      getLenis()?.start();
    };
  }, [open, close]);

  const transparent = isHome && !scrolled && !open && firstChapterDark;
  const isTucked = tucked && !open;

  return (
    <>
      <header
        ref={headerRef}
        onFocus={() => setTucked(false)}
        className={`fixed inset-x-0 top-0 z-50 border-b text-stone transition-[background-color,border-color,transform] duration-700 ease-long ${
          transparent ? "border-transparent bg-transparent" : "border-stone/10 bg-ink-deep/97"
        } ${isTucked ? "-translate-y-[101%]" : "translate-y-0"}`}
      >
        <div className="shell flex h-[var(--header-h)] items-center gap-6">
          <Link href="/" aria-label={brand.homeLabel[locale]} className="flex shrink-0 items-center gap-3">
            <span className="block size-9 lg:size-10">
              <Monogram size="100%" strokeWidth={3} />
            </span>
            <span className="grid leading-tight">
              {locale === "ar" ? (
                <span className="font-display text-[1.05rem]">{brand.short.ar}</span>
              ) : (
                <span className="font-lockup text-[0.78rem] font-medium uppercase tracking-[0.3em]">{brand.short.en}</span>
              )}
              <span className="label mt-0.5 text-[0.62rem] uppercase tracking-[0.2em] text-stone/70 [:root[lang=ar]_&]:text-[0.72rem]">
                {brand.sealCity[locale]}
              </span>
            </span>
          </Link>

          <nav aria-label={labels.mainNav[locale]} className="ms-auto hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-10">
              {menu.map((item) => {
                const current = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={`link-line label text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-700 [:root[lang=ar]_&]:text-[0.95rem] ${
                        current ? "text-gold" : "text-stone/85 hover:text-stone"
                      }`}
                    >
                      {item.label[locale]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-3 sm:gap-5 lg:ms-0">
            <Link
              href={pathname}
              locale={other}
              aria-label={labels.switchLabel[locale]}
              lang={other}
              className="link-line label text-[0.72rem] font-semibold tracking-[0.18em]"
            >
              {labels.switchShort[locale]}
            </Link>
            <Link href="/start-a-project" className="btn btn-on-dark hidden min-h-[44px] px-5 sm:inline-flex">
              {labels.startProject[locale]}
            </Link>
            <button
              ref={buttonRef}
              type="button"
              className="relative grid size-11 place-items-center lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="sr-only">{open ? labels.close[locale] : labels.menu[locale]}</span>
              <span aria-hidden="true" className="relative block h-3 w-6">
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-long ${
                    open ? "translate-y-[6px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-long ${
                    open ? "-translate-y-[5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
        <div
          ref={progressRef}
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-gold/80 [[dir=rtl]_&]:origin-right"
          style={{ transform: "scaleX(0)" }}
        />
      </header>

      {open && (
        <div
          ref={sheetRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu[locale]}
          className="lattice fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 flex flex-col overflow-y-auto bg-ink-deep text-stone lg:hidden"
        >
          <nav aria-label={labels.mainNav[locale]} className="shell pt-6">
            <ul>
              {menu.map((item, i) => (
                <li key={item.href} className="border-b border-stone/10">
                  <Link
                    href={item.href}
                    onClick={() => close()}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex items-baseline gap-5 py-4"
                  >
                    <span className="label num text-[0.7rem] text-gold">{twoDigit(i + 1, locale)}</span>
                    <span className="font-display text-[2rem] leading-tight [:root[lang=ar]_&]:text-[1.6rem]">{item.label[locale]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="shell mt-auto grid gap-6 pb-10 pt-12">
            <Link href="/start-a-project" onClick={() => close()} className="btn btn-on-dark w-full">
              {labels.startProject[locale]}
            </Link>
            <p className="label text-[0.7rem] text-stone/60">{brand.sealCity[locale]}</p>
          </div>
        </div>
      )}
    </>
  );
}
