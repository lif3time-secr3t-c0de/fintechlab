"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpgradeModal, type UpgradePrompt } from "@/components/billing/UpgradeModal";

export function InviteMemberForm({ workspaceId }: { workspaceId: string }): JSX.Element {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePrompt | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); setLoading(true);
    try {
      const response = await fetch("/api/workspaces/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId, email, role }) });
      const payload = await response.json() as UpgradePrompt & { message?: string };
      if (response.status === 402 || response.status === 429) return setUpgradePrompt(payload);
      if (!response.ok) throw new Error(payload.message ?? "Unable to invite member");
      setEmail(""); toast.success(payload.message ?? "Invitation sent");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to invite member"); }
    finally { setLoading(false); }
  }
  return <>
    <form onSubmit={submit} className="grid gap-2 rounded-md border border-border p-4 sm:grid-cols-[1fr_140px_auto]">
      <Input type="email" required aria-label="Member email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@company.com" />
      <select aria-label="Workspace role" value={role} onChange={(event) => setRole(event.target.value as "MEMBER" | "ADMIN")} className="h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></select>
      <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Invite"}</Button>
    </form>
    <UpgradeModal open={upgradePrompt !== null} onClose={() => setUpgradePrompt(null)} prompt={upgradePrompt} />
  </>;
}
