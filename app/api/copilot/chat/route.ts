import { NextResponse } from "next/server";
import { z } from "zod";
import { createCopilotStream } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";
import { getOrCreateUsage, getUsageLimits, incrementCopilotUsage } from "@/lib/utils/usage";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) })),
  threadId: z.string().optional(),
  context: z.string().optional(),
});

function monthResetAt(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const payload = schema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "validation_error", message: payload.error.message }, { status: 400 });
    }

    const usage = await getOrCreateUsage(user.id);
    const limits = getUsageLimits(user.plan);
    if (usage.copilotMsgs >= limits.copilotMessagesPerMonth) {
      return NextResponse.json(
        {
          error: "limit_exceeded",
          limit: limits.copilotMessagesPerMonth,
          used: usage.copilotMsgs,
          resetAt: monthResetAt(),
        },
        { status: 429 },
      );
    }

    if (payload.data.threadId) {
      const ownedThread = await prisma.copilotThread.findFirst({ where: { id: payload.data.threadId, userId: user.id }, select: { id: true } });
      if (!ownedThread) return NextResponse.json({ error: "thread_not_found" }, { status: 404 });
    }

    const anthropicResponse = await createCopilotStream({
      messages: payload.data.messages,
      context: payload.data.context,
    });
    if (!anthropicResponse.ok || !anthropicResponse.body) {
      return NextResponse.json({ error: "anthropic_error", message: `Anthropic request failed (${anthropicResponse.status})` }, { status: 502 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = anthropicResponse.body!.getReader();
        let buffer = "";
        let assistantText = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
              const event = JSON.parse(line.slice(6)) as { type?: string; delta?: { type?: string; text?: string } };
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && event.delta.text) {
                assistantText += event.delta.text;
                controller.enqueue(encoder.encode(event.delta.text));
              }
            }
          }
          const nextMessages = [...payload.data.messages, { role: "assistant" as const, content: assistantText }];
          const title = payload.data.messages.find((message) => message.role === "user")?.content.slice(0, 80) ?? "New thread";
          if (payload.data.threadId) {
            await prisma.copilotThread.update({ where: { id: payload.data.threadId }, data: { title, messages: nextMessages, context: payload.data.context } });
          } else {
            await prisma.copilotThread.create({ data: { userId: user.id, title, messages: nextMessages, context: payload.data.context } });
          }
          await incrementCopilotUsage(user.id);
          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "internal_error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
