"use client";

import posthog from "posthog-js";

export function initPosthog(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return;

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
  });
}

export function capturePosthogEvent(event: string, properties?: Record<string, unknown>): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return;

  posthog.capture(event, properties);
}
