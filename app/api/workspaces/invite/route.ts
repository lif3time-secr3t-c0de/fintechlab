import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";
import { PLAN_LIMITS, normalizePlan } from "@/lib/utils/tier";
import { getResend } from "@/lib/resend";

const schema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "validation_error", message: parsed.error.message }, { status: 400 });

    const { workspaceId, email, role } = parsed.data;
    const callerMembership = await prisma.workspaceMember.findUnique({ where: { userId_workspaceId: { userId: user.id, workspaceId } }, select: { role: true, workspace: { select: { name: true, ownerId: true } } } });
    if (!callerMembership || !["OWNER", "ADMIN"].includes(callerMembership.role)) return NextResponse.json({ error: "forbidden", message: "Owner or admin access is required." }, { status: 403 });
    const memberCount = await prisma.workspaceMember.count({ where: { workspaceId } });
    const owner = await prisma.user.findUnique({ where: { id: callerMembership.workspace.ownerId }, select: { plan: true } });
    const seatLimit = PLAN_LIMITS[normalizePlan(owner?.plan ?? user.plan)].teamSeats;
    if (memberCount >= seatLimit) return NextResponse.json({ error: "limit_exceeded", used: memberCount, limit: seatLimit, message: "Your plan seat limit has been reached." }, { status: 429 });

    // create waitlist-style invite as WaitlistEntry for simplicity, or WorkspaceMember directly if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // create workspace member directly
      await prisma.workspaceMember.upsert({
        where: { userId_workspaceId: { workspaceId, userId: existingUser.id } },
        update: { role: role ?? "MEMBER" },
        create: {
          workspaceId,
          userId: existingUser.id,
          role: role ?? "MEMBER",
        },
      });

      return NextResponse.json({ success: true, message: "User added to workspace." });
    }

    await prisma.waitlistEntry.upsert({ where: { email }, update: { name: "Workspace invitation", company: workspaceId }, create: { email, name: "Workspace invitation", company: workspaceId } });
    const resend = getResend();
    if (!resend) return NextResponse.json({ error: "missing_config", message: "Email service is not configured." }, { status: 503 });
    const result = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL ?? "hello@fintechlab.tech", to: email, subject: `Join ${callerMembership.workspace.name} on FintechLab`, html: `<h1>You're invited to ${callerMembership.workspace.name}</h1><p>Create your FintechLab account to join the workspace.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/sign-up">Accept invitation</a></p>` });
    if (result.error) return NextResponse.json({ error: "email_failed", message: result.error.message }, { status: 502 });

    return NextResponse.json({ success: true, message: "Invite recorded — user will be notified when they sign up." });
  } catch (err) {
    return NextResponse.json({ error: "internal_error", message: String(err) }, { status: 500 });
  }
}
