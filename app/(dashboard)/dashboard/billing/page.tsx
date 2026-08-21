"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/usePlan";
import { useUsage } from "@/hooks/useUsage";
import { capturePosthogEvent } from "@/lib/posthog";

export default function BillingPage(): JSX.Element {
  const plan = usePlan();
  const usage = useUsage();
  const [checkoutStatus, setCheckoutStatus] = useState<"success" | "cancelled" | null>(null);
  const [subscription, setSubscription] = useState<{ status: string; periodEnd: string | null; nextAmount: number; currency?: string } | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<"PRO" | "TEAM" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") setCheckoutStatus("success");
    if (params.get("cancelled") === "true") setCheckoutStatus("cancelled");
    void fetch("/api/billing/status").then(async (response) => { if (response.ok) setSubscription(await response.json() as typeof subscription); });
  }, []);

  async function onUpgrade(targetPlan: "PRO" | "TEAM"): Promise<void> {
    capturePosthogEvent("billing_upgrade_clicked", { targetPlan });
    const response = await fetch("/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: targetPlan }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      capturePosthogEvent("billing_upgrade_failed", { targetPlan, status: response.status });
      toast.error(payload.message ?? "Unable to start checkout");
      return;
    }
    const payload = (await response.json()) as { url?: string };
    if (payload.url) {
      capturePosthogEvent("billing_checkout_redirected", { targetPlan });
      window.location.href = payload.url;
    }
  }

  async function onManageBilling(): Promise<void> {
    capturePosthogEvent("billing_portal_clicked");
    const response = await fetch("/api/billing/portal", { method: "POST" });
    if (!response.ok) {
      capturePosthogEvent("billing_portal_failed", { status: response.status });
      return;
    }
    const payload = (await response.json()) as { url?: string };
    if (payload.url) {
      capturePosthogEvent("billing_portal_redirected");
      window.location.href = payload.url;
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Billing</h2>
      {checkoutStatus === "success" ? (
        <div className="rounded-md border border-green-500 bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">Checkout complete. Your plan is being activated.</div>
      ) : null}
      {checkoutStatus === "cancelled" ? (
        <div className="rounded-md border border-amber-500 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">Checkout was cancelled. Your current plan is unchanged.</div>
      ) : null}
      <div className="rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground">Current plan</p>
        <p className="text-xl font-semibold">{plan}</p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <p><span className="text-muted-foreground">Status:</span> <span className="capitalize">{subscription?.status ?? "Loading…"}</span></p>
          <p><span className="text-muted-foreground">Period ends:</span> {subscription?.periodEnd ? new Date(subscription.periodEnd).toLocaleDateString() : "—"}</p>
          <p><span className="text-muted-foreground">Next bill:</span> {subscription ? new Intl.NumberFormat(undefined, { style: "currency", currency: subscription.currency ?? "USD" }).format(subscription.nextAmount / 100) : "—"}</p>
        </div>
      </div>
      <div className="rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground">API calls</p>
        <p>
          {usage.apiCallsUsed} / {usage.apiCallsLimit}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Co-pilot messages</p>
        <p>
          {usage.copilotMessagesUsed} / {usage.copilotMessagesLimit}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setConfirmPlan("PRO")}>
          Upgrade to Pro
        </Button>
        <Button onClick={() => setConfirmPlan("TEAM")}>
          Upgrade to Team
        </Button>
        <Button variant="outline" onClick={() => void onManageBilling()}>
          Manage billing
        </Button>
      </div>
      {confirmPlan ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-plan-title"><div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl"><h3 id="confirm-plan-title" className="text-lg font-semibold">Switch to {confirmPlan}</h3><p className="mt-2 text-sm text-muted-foreground">You will continue to Stripe to confirm pricing and payment details.</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirmPlan(null)}>Cancel</Button><Button onClick={() => { const target = confirmPlan; setConfirmPlan(null); void onUpgrade(target); }}>Continue to Stripe</Button></div></div></div> : null}
    </section>
  );
}
