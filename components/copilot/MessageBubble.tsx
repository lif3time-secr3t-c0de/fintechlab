import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { CopilotMessage } from "@/types/copilot";

export function MessageBubble({ message }: { message: CopilotMessage }): JSX.Element {
  return (
    <div className={cn("max-w-[80%] rounded-lg p-3", message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
    </div>
  );
}
