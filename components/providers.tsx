"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { initPosthog } from "@/lib/posthog";

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    initPosthog();
  }, []);

  return <>{children}</>;
}
