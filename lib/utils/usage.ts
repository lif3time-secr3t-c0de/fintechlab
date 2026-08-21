import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, normalizePlan } from "@/lib/utils/tier";
import type { Plan } from "@/types/billing";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getOrCreateUsage(userId: string): Promise<{ apiCalls: number; copilotMsgs: number; month: string }> {
  const month = currentMonthKey();
  const usage = await prisma.usageRecord.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, apiCalls: 0, copilotMsgs: 0 },
    update: {},
    select: { apiCalls: true, copilotMsgs: true, month: true },
  });
  return usage;
}

export async function incrementApiUsage(userId: string): Promise<void> {
  const month = currentMonthKey();
  await prisma.usageRecord.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, apiCalls: 1, copilotMsgs: 0 },
    update: { apiCalls: { increment: 1 } },
  });
}

export async function incrementCopilotUsage(userId: string): Promise<void> {
  const month = currentMonthKey();
  await prisma.usageRecord.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, apiCalls: 0, copilotMsgs: 1 },
    update: { copilotMsgs: { increment: 1 } },
  });
}

export function getUsageLimits(plan: Plan): { apiCallsPerMonth: number; copilotMessagesPerMonth: number } {
  const limits = PLAN_LIMITS[normalizePlan(plan)];
  return {
    apiCallsPerMonth: limits.apiCallsPerMonth,
    copilotMessagesPerMonth: limits.copilotMessagesPerMonth,
  };
}
