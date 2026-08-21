import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";
import { PLAN_LIMITS, normalizePlan } from "@/lib/utils/tier";

const schema = z.object({ name: z.string().trim().min(2).max(80) });

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const payload = schema.safeParse(await request.json());
    if (!payload.success) return NextResponse.json({ error: "validation_error", message: payload.error.message }, { status: 400 });

    const workspaceCount = await prisma.workspaceMember.count({ where: { userId: user.id } });
    const limit = PLAN_LIMITS[normalizePlan(user.plan)].workspaces;
    if (workspaceCount >= limit) {
      return NextResponse.json({ error: "limit_exceeded", used: workspaceCount, limit, message: "Your current plan workspace limit has been reached." }, { status: 429 });
    }

    const baseSlug = payload.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "workspace";
    const workspace = await prisma.workspace.create({
      data: {
        name: payload.data.name,
        slug: `${baseSlug}-${randomUUID().slice(0, 8)}`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER" } },
      },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
