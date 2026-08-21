"use client";

import { MessageBubble } from "@/components/copilot/MessageBubble";
import type { CopilotMessage } from "@/types/copilot";

export function ChatWindow({ messages, streaming = false }: { messages: CopilotMessage[]; streaming?: boolean }): JSX.Element {
  if (messages.length === 0) {
    return <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Start a conversation with the co-pilot.</p>;
  }
  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      {messages.map((message, index) => (
        <div key={`${message.role}-${index}`}>
          <MessageBubble message={message} />
          {streaming && index === messages.length - 1 && message.role === "assistant" ? <span className="ml-3 inline-block animate-pulse" aria-label="Co-Pilot is streaming">▋</span> : null}
        </div>
      ))}
    </div>
  );
}
