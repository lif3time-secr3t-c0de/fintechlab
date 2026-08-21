export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CopilotChatRequest {
  messages: CopilotMessage[];
  threadId?: string;
  context?: string;
}
