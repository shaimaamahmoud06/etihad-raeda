"use server";

import { steps } from "@/content/pages/start-a-project";
import { clean, validateStep, type Values } from "@/lib/form-rules";

/* The "Start a project" server action (stub, §8.6). Re-checks every step with the same
   rules, creates a reference, and logs the lead with private fields masked.
   Production wiring still to build: Resend email to sales@raeda.ly (attachment included),
   an Odoo CRM lead via JSON-RPC (or a CMS fallback), and Cloudflare Turnstile. */

export type SubmitResult = { ok: true; reference: string } | { ok: false; error: "invalid" | "server" };

const privateFields = new Set(
  steps.flatMap((s) => s.parts.flatMap((p) => (p.kind === "fields" ? p.fields.filter((f) => f.private).map((f) => f.name) : []))),
);

const mask = (v: string) => (v.length <= 3 ? "…" : `${v[0]}…${v.slice(-2)}`);

export async function submitProject(formData: FormData): Promise<SubmitResult> {
  const values: Values = {};
  let file: File | null = null;
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size > 0) file = value;
    } else {
      values[key] = clean(value);
    }
  }

  for (const step of steps) {
    const errors = validateStep(step, values, file ? { size: file.size } : null);
    if (Object.keys(errors).length) return { ok: false, error: "invalid" };
  }

  // Development only: an email ending in @fail.test returns a server error.
  if (process.env.NODE_ENV !== "production" && values.email?.endsWith("@fail.test")) {
    return { ok: false, error: "server" };
  }

  const reference = `ER-${Date.now().toString(36).toUpperCase()}`;
  const logged = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, privateFields.has(k) && v ? mask(v) : v]));
  console.info("[lead]", reference, {
    ...logged,
    attachment: file ? { name: file.name, type: file.type, size: file.size } : null,
  });

  return { ok: true, reference };
}
