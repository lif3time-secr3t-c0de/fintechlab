"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CopilotMessage } from "@/types/copilot";
import type { UpgradePrompt } from "@/components/billing/UpgradeModal";

export function useCopilot() {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePrompt | null>(null);
  const [threads, setThreads] = useState<Array<{ id: string; title: string | null; context: string | null; updatedAt: string }>>([]);
  const [context, setContext] = useState("");

  const refreshThreads = useCallback(async (): Promise<void> => {
    const response = await fetch("/api/copilot/threads");
    if (response.ok) setThreads(await response.json() as typeof threads);
  }, []);

  useEffect(() => { void refreshThreads(); }, [refreshThreads]);

  async function createThread(): Promise<string | null> {
    const response = await fetch("/api/copilot/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New chat", messages: [] }),
    });
    if (!response.ok) {
      toast.error("Co-Pilot unavailable — check your API key");
      return null;
    }
    const thread = (await response.json()) as { id: string };
    setThreadId(thread.id);
    await refreshThreads();
    return thread.id;
  }

  async function newChat(): Promise<void> {
    setMessages([]);
    setInput("");
    setThreadId(null);
    setUpgradePrompt(null);
    await createThread();
  }

  async function selectThread(id: string): Promise<void> {
    const response = await fetch(`/api/copilot/threads/${id}`);
    if (!response.ok) {
      toast.error("Unable to load conversation");
      return;
    }
    const thread = await response.json() as { id: string; context: string | null; messages: CopilotMessage[] };
    setThreadId(thread.id);
    setContext(thread.context ?? "");
    setMessages(Array.isArray(thread.messages) ? thread.messages : []);
  }

  async function saveContext(): Promise<void> {
    if (!context.trim()) {
      toast.error("Add product context before saving");
      return;
    }
    const response = await fetch("/api/copilot/context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ threadId: threadId ?? undefined, context: context.trim() }) });
    if (!response.ok) {
      toast.error("Unable to save product context");
      return;
    }
    const saved = await response.json() as { id: string };
    if (!threadId) setThreadId(saved.id);
    toast.success("Product context saved");
    await refreshThreads();
  }

  async function sendMessage(context?: string): Promise<void> {
    if (!input.trim()) return;
    const userMessage: CopilotMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const activeThreadId = threadId ?? await createThread();
      if (!activeThreadId) return;
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, context, threadId: activeThreadId }),
      });
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as UpgradePrompt & { message?: string };
        if (response.status === 402 || response.status === 429) setUpgradePrompt(errorPayload);
        toast.error("Co-Pilot unavailable — check your API key");
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) return;
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += new TextDecoder().decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
      await refreshThreads();
    } finally {
      setLoading(false);
    }
  }

  return {
    messages,
    input,
    setInput,
    sendMessage,
    loading,
    newChat,
    threadId,
    upgradePrompt,
    clearUpgradePrompt: () => setUpgradePrompt(null),
    threads,
    selectThread,
    context,
    setContext,
    saveContext,
  };
}
