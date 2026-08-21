"use client";

import { Card } from "@/components/ui/card";
import { useUsage } from "@/hooks/useUsage";

export function UsageStats(): JSX.Element {
  const usage = useUsage();
  const metrics = [
    { label: "API calls (month)", used: usage.apiCallsUsed, limit: usage.apiCallsLimit },
    { label: "Co-pilot messages", used: usage.copilotMessagesUsed, limit: usage.copilotMessagesLimit },
    { label: "Workspaces", used: usage.workspacesUsed ?? 0, limit: usage.workspacesLimit ?? 1 },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => {
        const finite = Number.isFinite(metric.limit);
        const percent = finite && metric.limit > 0 ? Math.min(100, (metric.used / metric.limit) * 100) : 0;
        return <Card key={metric.label}>
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="mt-1 text-2xl font-semibold">{metric.used} / {finite ? metric.limit : "Unlimited"}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-label={`${metric.label} usage`}><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div>
        </Card>;
      })}
    </div>
  );
}
