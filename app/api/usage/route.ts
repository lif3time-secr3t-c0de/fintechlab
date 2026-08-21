import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/server/user";
import { getOrCreateUsage, getUsageLimits } from "@/lib/utils/usage";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, normalizePlan } from "@/lib/utils/tier";

export async function GET(): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const usage = await getOrCreateUsage(user.id);
    const limits = getUsageLimits(user.plan);
    const workspacesUsed = await prisma.workspaceMember.count({ where: { userId: user.id } });
    const workspacesLimit = PLAN_LIMITS[normalizePlan(user.plan)].workspaces;
    return NextResponse.json({
      plan: user.plan,
      apiCallsUsed: usage.apiCalls,
      apiCallsLimit: limits.apiCallsPerMonth,
      copilotMessagesUsed: usage.copilotMsgs,
      copilotMessagesLimit: limits.copilotMessagesPerMonth,
      workspacesUsed,
      workspacesLimit,
    });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
