import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().optional(),
  context: z.string().optional(),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
});

export async function GET(request: Request, { params }: { params: { threadId: string } }) {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { threadId } = params;
    const thread = await prisma.copilotThread.findUnique({ where: { id: threadId } });
    if (!thread || thread.userId !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json(thread);
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { threadId: string } }) {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { threadId } = params;
    const payload = updateSchema.safeParse(await request.json());
    if (!payload.success) return NextResponse.json({ error: "validation_error", message: payload.error.message }, { status: 400 });

    const existing = await prisma.copilotThread.findUnique({ where: { id: threadId } });
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const updated = await prisma.copilotThread.update({
      where: { id: threadId },
      data: {
        title: payload.data.title,
        context: payload.data.context,
        messages: payload.data.messages,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { threadId: string } }) {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { threadId } = params;
    const existing = await prisma.copilotThread.findUnique({ where: { id: threadId } });
    if (!existing || existing.userId !== user.id) return NextResponse.json({ error: "not_found" }, { status: 404 });

    await prisma.copilotThread.delete({ where: { id: threadId } });
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
