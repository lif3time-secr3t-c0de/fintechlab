import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().optional(),
  context: z.string().optional(),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
});

export async function GET(): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const threads = await prisma.copilotThread.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: { id: true, title: true, context: true, updatedAt: true },
    });

    return NextResponse.json(threads);
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const payload = createSchema.safeParse(await request.json());
    if (!payload.success) return NextResponse.json({ error: "validation_error", message: payload.error.message }, { status: 400 });

    const created = await prisma.copilotThread.create({
      data: {
        userId: user.id,
        title: payload.data.title ?? undefined,
        context: payload.data.context ?? undefined,
        messages: payload.data.messages ?? [],
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
