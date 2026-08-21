"use client";

import { useEffect, useState } from "react";
import type { Plan } from "@/types/billing";

export function usePlan() {
  const [plan, setPlan] = useState<Plan>("FREE");

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/usage");
      if (!response.ok) return;
      const data = (await response.json()) as { plan?: Plan };
      if (data.plan) setPlan(data.plan);
    })();
  }, []);

  return plan;
}
