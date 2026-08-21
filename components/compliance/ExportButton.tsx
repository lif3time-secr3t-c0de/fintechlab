"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { capturePosthogEvent } from "@/lib/posthog";
import { UpgradeModal, type UpgradePrompt } from "@/components/billing/UpgradeModal";

export function ExportButton({
  format,
  jurisdiction,
  productType,
}: {
  format: "pdf" | "md" | "csv";
  jurisdiction: string;
  productType: string;
}): JSX.Element {
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePrompt | null>(null);

  async function handleRestrictedResponse(response: Response): Promise<boolean> {
    if (response.status !== 402 && response.status !== 429) return false;
    const payload = (await response.json().catch(() => ({}))) as UpgradePrompt;
    setUpgradePrompt(payload);
    if (response.status === 402) toast.error("Upgrade to Pro to export");
    return true;
  }

  async function onExport(): Promise<void> {
    capturePosthogEvent("compliance_export_clicked", { format });

    if (format === "csv") {
      const params = new URLSearchParams({ jurisdiction, product: productType });
      const response = await fetch(`/api/compliance/export/csv?${params}`, { method: "POST" });
      if (await handleRestrictedResponse(response)) return;
      if (!response.ok) {
        capturePosthogEvent("compliance_export_failed", { format, status: response.status });
        return;
      }
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `compliance.csv`;
      link.click();
      URL.revokeObjectURL(href);
      capturePosthogEvent("compliance_export_downloaded", { format });
      return;
    }

    const params = new URLSearchParams({ format, jurisdiction, product: productType });
    const response = await fetch(`/api/compliance/export?${params}`, { method: "POST" });
    if (await handleRestrictedResponse(response)) return;
    if (!response.ok) {
      capturePosthogEvent("compliance_export_failed", { format, status: response.status });
      return;
    }
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `compliance.${format === "md" ? "md" : "pdf"}`;
    link.click();
    URL.revokeObjectURL(href);
    capturePosthogEvent("compliance_export_downloaded", { format });
  }

  return (
    <>
      <Button variant="outline" onClick={() => void onExport()}>
        Export {format.toUpperCase()}
      </Button>
      <UpgradeModal open={upgradePrompt !== null} onClose={() => setUpgradePrompt(null)} prompt={upgradePrompt} />
    </>
  );
}
