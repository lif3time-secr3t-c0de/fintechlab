"use client";

import { useEffect, useState } from "react";
import type { PlanUsage } from "@/types/billing";

const initialUsage: PlanUsage = {
  apiCallsUsed: 0,
  apiCallsLimit: 500,
  copilotMessagesUsed: 0,
  copilotMessagesLimit: 50,
};

export function useUsage() {
  const [usage, setUsage] = useState<PlanUsage>(initialUsage);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/usage");
      if (!response.ok) return;
      const data = (await response.json()) as PlanUsage;
      setUsage(data);
    })();
  }, []);

  return usage;
}
