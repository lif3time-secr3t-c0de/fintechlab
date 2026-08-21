import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";

const schema = z.object({
  threadId: z.string().optional(),
  context: z.string().min(1),
});

export async function GET(): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const thread = await prisma.copilotThread.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, context: true },
    });
    return NextResponse.json({ threadId: thread?.id ?? null, context: thread?.context ?? "" });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "validation_error", message: parsed.error.message }, { status: 400 });
    }

    const thread = parsed.data.threadId
      ? await prisma.copilotThread.update({
          where: { id: parsed.data.threadId },
          data: { context: parsed.data.context },
          select: { id: true, context: true },
        })
      : await prisma.copilotThread.create({
          data: {
            userId: user.id,
            title: "Context thread",
            context: parsed.data.context,
            messages: [],
          },
          select: { id: true, context: true },
        });

    return NextResponse.json(thread);
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
