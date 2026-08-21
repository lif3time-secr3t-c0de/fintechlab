import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";

const bodySchema = z.object({ role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional(), _method: z.string().optional() });

export async function POST(request: Request, { params }: { params: { memberId: string } }) {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.formData().then((fd) => Object.fromEntries(fd.entries()));
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "validation_error", message: parsed.error.message }, { status: 400 });

    const { memberId } = params;
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      select: { workspaceId: true, userId: true, role: true },
    });
    if (!targetMember) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const callerMembership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId: targetMember.workspaceId } },
      select: { role: true },
    });
    if (!callerMembership || !["OWNER", "ADMIN"].includes(callerMembership.role)) {
      return NextResponse.json({ error: "forbidden", message: "Owner or admin access is required." }, { status: 403 });
    }
    if (callerMembership.role === "ADMIN" && targetMember.role === "OWNER") {
      return NextResponse.json({ error: "forbidden", message: "Admins cannot modify workspace owners." }, { status: 403 });
    }

    if (parsed.data._method === "delete") {
      await prisma.workspaceMember.delete({ where: { id: memberId } });
      return NextResponse.json({ success: true, message: "Member removed." });
    }

    if (!parsed.data.role) return NextResponse.json({ error: "validation_error", message: "role required" }, { status: 400 });

    const updated = await prisma.workspaceMember.update({ where: { id: memberId }, data: { role: parsed.data.role } });
    return NextResponse.json({ success: true, member: updated });
  } catch (err) {
    return NextResponse.json({ error: "internal_error", message: String(err) }, { status: 500 });
  }
}
