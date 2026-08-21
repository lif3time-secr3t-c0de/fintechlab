"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/usePlan";

export interface UpgradePrompt {
  limit?: number;
  used?: number;
  message?: string;
}

export function UpgradeModal({
  open,
  onClose,
  prompt,
}: {
  open: boolean;
  onClose: () => void;
  prompt?: UpgradePrompt | null;
}): JSX.Element | null {
  const plan = usePlan();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
        <h2 id="upgrade-title" className="text-xl font-semibold">Upgrade your plan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {prompt?.message ?? "You have reached a limit or this feature is not included in your current plan."}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-muted p-3 text-sm">
          <div><dt className="text-muted-foreground">Current plan</dt><dd className="font-medium">{plan}</dd></div>
          <div>
            <dt className="text-muted-foreground">Usage limit</dt>
            <dd className="font-medium">
              {prompt?.limit === undefined ? "Plan restricted" : `${prompt.used ?? 0} / ${prompt.limit}`}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Not now</Button>
          <Link href="/dashboard/billing" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            View upgrade options
          </Link>
        </div>
      </div>
    </div>
  );
}
