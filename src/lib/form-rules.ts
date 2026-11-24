import type { Step } from "@/content/pages/start-a-project";
import { toLatinDigits } from "./format";

/* Validation rules (§8.5). The same code runs in the browser and on the server. */

export type ErrorKey = "choice" | "numbers" | "required" | "phone" | "email" | "fileSize";
/** Field name → error. Numbers groups report under the group key "numbers:<first field>". */
export type Errors = Record<string, ErrorKey>;

export type Values = Record<string, string>;
export type FileInfo = { size: number } | null;

/** Trim and convert Arabic/Persian digits to Latin before checking and before sending. */
export const clean = (v: string | undefined | null) => toLatinDigits(String(v ?? "")).trim();

export const numbersKey = (fields: { name: string }[]) => `numbers:${fields[0].name}`;

/** National digits: remove non-digits, a leading 218 and a leading 0. */
export function nationalDigits(phone: string): string {
  let d = clean(phone).replace(/\D/g, "");
  if (d.startsWith("218")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(step: Step, values: Values, file: FileInfo = null): Errors {
  const errors: Errors = {};

  for (const part of step.parts) {
    switch (part.kind) {
      case "choice": {
        const v = clean(values[part.name]);
        if (part.required && !part.options.some((o) => o.value === v)) errors[part.name] = "choice";
        break;
      }
      case "numbers": {
        const any = part.fields.some((f) => /\d/.test(clean(values[f.name])));
        if (!any) errors[numbersKey(part.fields)] = "numbers";
        break;
      }
      case "city": {
        if (part.required && !clean(values[part.name])) errors[part.name] = "required";
        break;
      }
      case "file": {
        if (file && file.size > part.maxBytes) errors[part.name] = "fileSize";
        break;
      }
      case "fields": {
        for (const f of part.fields) {
          const v = clean(values[f.name]);
          const prefill = (f.prefill ?? "").trim();
          if (f.type === "tel") {
            const d = nationalDigits(v);
            if (!d) {
              if (f.required) errors[f.name] = "required";
            } else if (d.length < 8 || d.length > 10) {
              errors[f.name] = "phone";
            }
          } else if (f.type === "email") {
            if (!v) {
              if (f.required) errors[f.name] = "required";
            } else if (!EMAIL.test(v)) {
              errors[f.name] = "email";
            }
          } else if (f.required && (!v || v === prefill)) {
            errors[f.name] = "required";
          }
        }
        break;
      }
    }
  }
  return errors;
}

/** Every field name a step owns (used to clear and collect values). */
export function stepFieldNames(step: Step): string[] {
  return step.parts.flatMap((p) => {
    switch (p.kind) {
      case "choice":
      case "city":
      case "file":
        return [p.name];
      case "numbers":
        return p.fields.map((f) => f.name);
      case "fields":
        return p.fields.map((f) => f.name);
    }
  });
}
