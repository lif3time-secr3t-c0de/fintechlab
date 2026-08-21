"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { capturePosthogEvent } from "@/lib/posthog";

export function WaitlistForm(): JSX.Element {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed to join waitlist");
      toast.success("You're on the waitlist.");
      capturePosthogEvent("waitlist_joined", { source: "marketing_page" });
      setEmail("");
      window.location.assign("/waitlist/confirm");
    } catch (error) {
      capturePosthogEvent("waitlist_join_failed", { source: "marketing_page" });
      toast.error(error instanceof Error ? error.message : "Failed to join waitlist");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-xl flex-col gap-2 sm:flex-row">
      <Input
        aria-label="Email address"
        type="email"
        required
        placeholder="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button disabled={loading} type="submit" className="w-full sm:w-auto">
        {loading ? "Joining..." : "Join waitlist"}
      </Button>
    </form>
  );
}
