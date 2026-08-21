"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpgradeModal, type UpgradePrompt } from "@/components/billing/UpgradeModal";

export function CreateWorkspaceForm(): JSX.Element {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePrompt | null>(null);

  async function createWorkspace(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = (await response.json().catch(() => ({}))) as UpgradePrompt & { message?: string };
      if (response.status === 402 || response.status === 429) {
        setUpgradePrompt(payload);
        return;
      }
      if (!response.ok) throw new Error(payload.message ?? "Unable to create workspace");
      setName("");
      setShowForm(false);
      toast.success("Workspace created");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!showForm ? <Button onClick={() => setShowForm(true)}>Create Workspace</Button> : (
        <form onSubmit={createWorkspace} className="flex max-w-xl flex-col gap-2 rounded-md border border-border p-4 sm:flex-row">
          <Input aria-label="Workspace name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Workspace name" />
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
          <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
        </form>
      )}
      <UpgradeModal open={upgradePrompt !== null} onClose={() => setUpgradePrompt(null)} prompt={upgradePrompt} />
    </>
  );
}
