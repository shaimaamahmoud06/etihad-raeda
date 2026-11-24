"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { messages, steps, type ChoicePart, type CityPart, type FieldsPart, type FilePart, type NumbersPart } from "@/content/pages/start-a-project";
import { emails } from "@/content/global";
import type { Locale } from "@/content/types";
import { clean, numbersKey, validateStep, type Errors, type ErrorKey, type Values } from "@/lib/form-rules";
import { fill, formatNumber } from "@/lib/format";
import { track } from "@/lib/track";
import { submitProject } from "@/actions/project";
import { Monogram } from "@/components/ui/Monogram";
import { Arrow } from "@/components/ui/Arrow";

/* The B2B form (§8): one question per screen, built entirely from content.
   Flow: steps → send → "Book a call?" → booking calendar → booked. */

type Phase = "form" | "sent" | "booking" | "booked";

const initialValues = (): Values => {
  const v: Values = {};
  for (const s of steps)
    for (const p of s.parts) if (p.kind === "fields") for (const f of p.fields) if (f.prefill) v[f.name] = f.prefill;
  return v;
};

const reduceMotion = () =>
  document.documentElement.classList.contains("force-reduce") || matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ProjectForm({ locale }: { locale: Locale }) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Values>(initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [reference, setReference] = useState("");
  const headingRef = useRef<HTMLElement | null>(null);
  const setHeading = useCallback((el: HTMLElement | null) => {
    headingRef.current = el;
  }, []);
  const formRef = useRef<HTMLFormElement>(null);
  const moved = useRef(false);

  const step = steps[index];
  const last = index === steps.length - 1;
  const t = (k: ErrorKey) => messages.errors[k][locale];

  // Move focus to each new question (not on first load), and bring it gently into view.
  useEffect(() => {
    if (!moved.current) return;
    const h = headingRef.current;
    if (!h) return;
    h.focus({ preventScroll: true });
    h.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
  }, [index, phase]);

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  };
  const clearError = (key: string) =>
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });

  const focusFirstInvalid = (errs: Errors) => {
    const first = Object.keys(errs)[0];
    if (!first || !formRef.current) return;
    const name = first.startsWith("numbers:") ? first.slice(8) : first;
    const el =
      formRef.current.querySelector<HTMLElement>(`[name="${name}"]:checked`) ??
      formRef.current.querySelector<HTMLElement>(`[name="${name}"]:not([type=file])`) ??
      formRef.current.querySelector<HTMLElement>(`[data-file-button="${name}"]`);
    el?.focus();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const errs = validateStep(step, values, file ? { size: file.size } : null);
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstInvalid(errs);
      return;
    }
    if (!last) {
      moved.current = true;
      setIndex(index + 1);
      track("form_step", { step: index + 2 });
      return;
    }
    setSending(true);
    setServerError(false);
    const fd = new FormData();
    for (const [k, v] of Object.entries(values)) fd.append(k, clean(v));
    fd.append("locale", locale);
    if (file) fd.append("attachment", file);
    try {
      const res = await submitProject(fd);
      if (res.ok) {
        setReference(res.reference);
        moved.current = true;
        setPhase("sent");
        track("form_submit", { orgType: values.organisation_type ?? "", projectType: values.project_type ?? "" });
      } else {
        setServerError(true);
      }
    } catch {
      setServerError(true);
    } finally {
      setSending(false);
    }
  };

  const back = () => {
    setErrors({});
    setServerError(false);
    moved.current = true;
    setIndex(Math.max(0, index - 1));
  };

  if (phase !== "form") {
    return (
      <AfterSend
        locale={locale}
        phase={phase}
        reference={reference}
        values={values}
        setHeading={setHeading}
        onBook={() => setPhase("booking")}
        onBooked={() => {
          setPhase("booked");
          track("call_booked", {});
        }}
      />
    );
  }

  const qid = `q-${step.id}`;
  const errorText = (key: string) =>
    errors[key] ? (
      <p role="alert" className="mt-3 text-[0.9rem] text-error">
        {t(errors[key])}
      </p>
    ) : null;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit}>
      <div>
        <p className="label text-[0.72rem] font-medium uppercase tracking-[0.2em] text-walnut [:root[lang=ar]_&]:text-[0.9rem]">
          {fill(messages.stepOf[locale], { n: formatNumber(index + 1, locale), total: formatNumber(steps.length, locale) })}
        </p>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <span key={i} className={`h-[3px] flex-1 transition-colors duration-700 ${i <= index ? "bg-ink" : "bg-ink/12"}`} />
          ))}
        </div>
      </div>

      <div key={step.id} className="step-in mt-12 min-h-[22rem] sm:mt-16">
        <h2 id={qid} ref={setHeading} tabIndex={-1} className="display t-h2 max-w-[22ch] outline-none">
          {step.question[locale]}
        </h2>
        {step.help && <p className="mt-4 text-ink/70">{step.help[locale]}</p>}

        <div className="mt-10 grid gap-10">
          {step.parts.map((part, pi) => {
            switch (part.kind) {
              case "choice":
                return <Choice key={pi} part={part} qid={qid} locale={locale} value={values[part.name] ?? ""} onChange={(v) => set(part.name, v)} error={errorText(part.name)} invalid={!!errors[part.name]} />;
              case "numbers":
                return <Numbers key={pi} part={part} locale={locale} values={values} onChange={(n, v) => { set(n, v); clearError(numbersKey(part.fields)); }} error={errorText(numbersKey(part.fields))} invalid={!!errors[numbersKey(part.fields)]} />;
              case "file":
                return <FileField key={pi} part={part} locale={locale} file={file} onChange={(f) => { setFile(f); clearError(part.name); }} error={errorText(part.name)} />;
              case "city":
                return <City key={pi} part={part} qid={qid} locale={locale} value={values[part.name] ?? ""} onChange={(v) => set(part.name, v)} error={errorText(part.name)} invalid={!!errors[part.name]} />;
              case "fields":
                return <Fields key={pi} part={part} locale={locale} values={values} onChange={set} errors={errors} errorText={errorText} />;
            }
          })}
        </div>
      </div>

      {serverError && (
        <p role="alert" className="mt-10 border-s-2 border-error ps-4 text-error">
          {messages.sendError[locale]}{" "}
          <a href={`mailto:${emails.sales}`} className="ltr underline underline-offset-4">
            {emails.sales}
          </a>
        </p>
      )}

      <div className="mt-12 flex items-center justify-between gap-6 border-t border-ink/15 pt-8">
        {index > 0 ? (
          <button type="button" onClick={back} className="link-line">
            <Arrow back />
            {messages.back[locale]}
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn btn-ink" disabled={sending}>
          {sending ? messages.sending[locale] : last ? messages.send[locale] : messages.next[locale]}
          {!sending && <Arrow />}
        </button>
      </div>
    </form>
  );
}

/* ── Parts ──────────────────────────────────────────────────────────── */

function Tick() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2.5 6.2 5 8.6l4.6-5.2" />
    </svg>
  );
}

function Choice({
  part,
  qid,
  locale,
  value,
  onChange,
  error,
  invalid,
}: {
  part: ChoicePart;
  qid: string;
  locale: Locale;
  value: string;
  onChange: (v: string) => void;
  error: React.ReactNode;
  invalid: boolean;
}) {
  const subId = `${qid}-${part.name}`;
  return (
    <div className={part.question ? "mt-4" : ""}>
      {part.question && (
        <h3 id={subId} className="display t-h3 mb-6">
          {part.question[locale]}
        </h3>
      )}
      <div role="radiogroup" aria-labelledby={part.question ? subId : qid} aria-invalid={invalid || undefined} className={`grid gap-2.5 ${part.columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {part.options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex min-h-14 cursor-pointer items-center justify-between gap-4 border px-5 py-3.5 text-[1.02rem] transition-colors duration-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
                checked ? "border-ink bg-ink text-stone" : invalid ? "border-error/60 hover:border-ink/60" : "border-ink/20 hover:border-ink/60"
              }`}
            >
              <input type="radio" name={part.name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
              <span>{o.label[locale]}</span>
              <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${checked ? "border-gold bg-gold text-ink-deep" : "border-current/40"}`}>
                {checked && <Tick />}
              </span>
            </label>
          );
        })}
      </div>
      {error}
    </div>
  );
}

const inputClass = (invalid: boolean, ltr = false) =>
  `w-full border-0 border-b bg-transparent py-3 text-[1.1rem] outline-none transition-colors duration-500 focus:border-ink ${
    invalid ? "border-error" : "border-ink/30"
  } ${ltr ? "ltr text-left [:root[lang=ar]_&]:text-right" : ""}`;

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-[0.92rem] text-ink/80">
      {children}
      {optional && <span className="ms-1.5 text-ink/55">{optional}</span>}
    </label>
  );
}

function Numbers({
  part,
  locale,
  values,
  onChange,
  error,
  invalid,
}: {
  part: NumbersPart;
  locale: Locale;
  values: Values;
  onChange: (name: string, v: string) => void;
  error: React.ReactNode;
  invalid: boolean;
}) {
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-3">
        {part.fields.map((f) => (
          <div key={f.name}>
            <FieldLabel htmlFor={`f-${f.name}`}>{f.label[locale]}</FieldLabel>
            <input
              id={`f-${f.name}`}
              name={f.name}
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={values[f.name] ?? ""}
              onChange={(e) => onChange(f.name, e.target.value)}
              aria-invalid={invalid || undefined}
              className={inputClass(invalid, true)}
            />
          </div>
        ))}
      </div>
      {error}
    </div>
  );
}

function FileField({
  part,
  locale,
  file,
  onChange,
  error,
}: {
  part: FilePart;
  locale: Locale;
  file: File | null;
  onChange: (f: File | null) => void;
  error: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="mt-4">
      <p className="text-ink/85" id={`l-${part.name}`}>
        {part.label[locale]}
      </p>
      <p className="mt-1 text-[0.85rem] text-ink/65">{part.hint[locale]}</p>
      <input
        ref={ref}
        type="file"
        name={part.name}
        accept={part.accept.join(",")}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        aria-labelledby={`l-${part.name}`}
      />
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" data-file-button={part.name} className="btn btn-line-ink" onClick={() => ref.current?.click()} aria-describedby={`l-${part.name}`}>
          {part.choose[locale]}
        </button>
        {file && (
          <>
            <span className="ltr max-w-[16rem] truncate text-[0.95rem]">{file.name}</span>
            <button
              type="button"
              className="text-[0.95rem] text-walnut underline underline-offset-4"
              onClick={() => {
                onChange(null);
                if (ref.current) ref.current.value = "";
              }}
            >
              {part.remove[locale]}
            </button>
          </>
        )}
      </div>
      {error}
    </div>
  );
}

function City({
  part,
  qid,
  locale,
  value,
  onChange,
  error,
  invalid,
}: {
  part: CityPart;
  qid: string;
  locale: Locale;
  value: string;
  onChange: (v: string) => void;
  error: React.ReactNode;
  invalid: boolean;
}) {
  return (
    <div>
      <input
        id={`f-${part.name}`}
        name={part.name}
        type="text"
        autoComplete={part.autocomplete}
        aria-labelledby={qid}
        aria-invalid={invalid || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(invalid)} max-w-[28rem]`}
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {part.quickPicks.map((c) => {
          const pressed = value === c[locale];
          return (
            <button
              key={c.en}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(c[locale])}
              className={`border px-4 py-2 text-[0.9rem] transition-colors duration-500 ${pressed ? "border-ink bg-ink text-stone" : "border-ink/20 hover:border-ink/60"}`}
            >
              {c[locale]}
            </button>
          );
        })}
      </div>
      {error}
    </div>
  );
}

function Fields({
  part,
  locale,
  values,
  onChange,
  errors,
  errorText,
}: {
  part: FieldsPart;
  locale: Locale;
  values: Values;
  onChange: (name: string, v: string) => void;
  errors: Errors;
  errorText: (key: string) => React.ReactNode;
}) {
  return (
    <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
      {part.fields.map((f) => (
        <div key={f.name}>
          <FieldLabel htmlFor={`f-${f.name}`} optional={f.required ? undefined : messages.optional[locale]}>
            {f.label[locale]}
          </FieldLabel>
          <input
            id={`f-${f.name}`}
            name={f.name}
            type={f.type === "tel" ? "tel" : f.type === "email" ? "email" : "text"}
            inputMode={f.type === "tel" ? "tel" : undefined}
            autoComplete={f.autocomplete}
            dir={f.ltr ? "ltr" : undefined}
            value={values[f.name] ?? ""}
            onChange={(e) => onChange(f.name, e.target.value)}
            aria-invalid={!!errors[f.name] || undefined}
            aria-required={f.required || undefined}
            className={inputClass(!!errors[f.name], f.ltr)}
          />
          {errorText(f.name)}
        </div>
      ))}
    </div>
  );
}

/* ── After sending ──────────────────────────────────────────────────── */

function AfterSend({
  locale,
  phase,
  reference,
  values,
  setHeading,
  onBook,
  onBooked,
}: {
  locale: Locale;
  phase: Exclude<Phase, "form">;
  reference: string;
  values: Values;
  setHeading: (el: HTMLElement | null) => void;
  onBook: () => void;
  onBooked: () => void;
}) {
  const contactFields = steps.flatMap((s) => s.parts.flatMap((p) => (p.kind === "fields" ? p.fields : [])));
  const summary = contactFields.filter((f) => {
    const v = (values[f.name] ?? "").trim();
    return v && v !== (f.prefill ?? "").trim();
  });

  return (
    <div key={phase} className="step-in">
      <Monogram size={48} />
      {phase === "sent" && (
        <>
          <h2 ref={setHeading} tabIndex={-1} className="display t-h1 mt-8 outline-none">
            {messages.sent.title[locale]}
          </h2>
          <p className="label mt-5 text-[0.8rem] text-walnut">
            {messages.sent.reference[locale].split("{reference}")[0]}
            <span className="ltr">{reference}</span>
            {messages.sent.reference[locale].split("{reference}")[1]}
          </p>
          <p className="t-lead mt-12">{messages.sent.prompt[locale]}</p>
          <button type="button" onClick={onBook} className="btn btn-ink mt-6">
            {messages.sent.book[locale]}
            <Arrow />
          </button>
          <p className="mt-8 text-ink/70">{messages.sent.note[locale]}</p>
        </>
      )}
      {phase === "booking" && (
        <div className="mt-8 border border-dashed border-ink/30 bg-stone-deep/60 p-6 sm:p-10">
          <span ref={setHeading} tabIndex={-1} className="pending-tag text-walnut outline-none">
            {messages.booking.tag[locale]}
          </span>
          <p className="mt-4 text-ink/75">{messages.booking.note[locale]}</p>
          {summary.length > 0 && (
            <dl className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {summary.map((f) => (
                <div key={f.name}>
                  <dt className="text-[0.8rem] text-ink/60">{f.label[locale]}</dt>
                  <dd className={f.ltr ? "ltr" : ""}>{values[f.name]}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-8 grid grid-cols-5 gap-2" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="h-9 bg-ink/8" />
            ))}
          </div>
          <button type="button" onClick={onBooked} className="btn btn-line-ink mt-8">
            {messages.booking.simulate[locale]}
          </button>
        </div>
      )}
      {phase === "booked" && (
        <h2 ref={setHeading} tabIndex={-1} className="display t-h2 mt-8 max-w-[24ch] outline-none">
          {messages.booked.title[locale]}
        </h2>
      )}
    </div>
  );
}
