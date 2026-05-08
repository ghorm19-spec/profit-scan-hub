import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

let started = false;
export function initSentry() {
  if (started || !DSN) return;
  if (typeof window === "undefined") return;
  // Skip in Lovable preview iframes to keep error budget clean.
  const host = window.location.hostname;
  if (host.includes("lovableproject.com") || host.includes("id-preview--")) return;
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    environment: import.meta.env.MODE,
  });
  started = true;
}

export { Sentry };
