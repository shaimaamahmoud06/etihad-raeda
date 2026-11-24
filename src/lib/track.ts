/* Analytics stub (§13). Events go to window.dataLayer with a timestamp, so GA4 or
   Plausible can be attached later without touching the call sites. */

type Events = {
  wa_click: { item: string; code: string; collection: string; placement: string };
  form_step: { step: number };
  form_submit: { orgType: string; projectType: string };
  call_booked: Record<string, never>;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track<K extends keyof Events>(event: K, data: Events[K]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...data, ts: Date.now() });
}
