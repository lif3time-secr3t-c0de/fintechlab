"use client";

import { ChatWindow } from "@/components/copilot/ChatWindow";
import { ContextPanel } from "@/components/copilot/ContextPanel";
import { SuggestedPrompts } from "@/components/copilot/SuggestedPrompts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCopilot } from "@/hooks/useCopilot";
import { UpgradeModal } from "@/components/billing/UpgradeModal";

export default function CopilotPage(): JSX.Element {
  const { messages, input, setInput, sendMessage, loading, newChat, upgradePrompt, clearUpgradePrompt, threads, selectThread, context, setContext, saveContext } = useCopilot();

  return (
    <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <Button className="w-full" variant="outline" disabled={loading} onClick={() => void newChat()}>
          New chat
        </Button>
        <div className="space-y-1" aria-label="Conversation history">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">History</p>
          {threads.length === 0 ? <p className="text-sm text-muted-foreground">No saved conversations yet.</p> : threads.map((thread) => (
            <button key={thread.id} type="button" onClick={() => void selectThread(thread.id)} className="w-full truncate rounded-md px-3 py-2 text-left text-sm hover:bg-muted" aria-label={`Open ${thread.title ?? "Untitled chat"}`}>
              {thread.title ?? "Untitled chat"}
            </button>
          ))}
        </div>
        <ContextPanel value={context} onChange={setContext} />
        <Button className="w-full" size="sm" onClick={() => void saveContext()}>Save context</Button>
      </aside>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">AI Financial Co-Pilot</h2>
        {messages.length === 0 ? <SuggestedPrompts onSelect={setInput} /> : null}
        <ChatWindow messages={messages} streaming={loading} />
        <div className="space-y-2">
          <Textarea
            aria-label="Message input"
            value={input}
            maxLength={4000}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage(context);
              }
            }}
            placeholder="Ask about compliance, payments, or fintech strategy..."
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{input.length}/4000</span>
            <Button disabled={loading} onClick={() => void sendMessage(context)}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
      <UpgradeModal open={upgradePrompt !== null} onClose={clearUpgradePrompt} prompt={upgradePrompt} />
    </section>
  );
}
