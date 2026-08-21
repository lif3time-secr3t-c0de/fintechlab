import type { Plan } from "@/types/billing";
import type { ApiType } from "@/types/sandbox";

export const PLAN_LIMITS = {
  FREE: {
    apiCallsPerMonth: 500,
    copilotMessagesPerMonth: 50,
    apiTypes: ["KYC", "ACH", "OPEN_BANKING"],
    workspaces: 1,
    teamSeats: 1,
    complianceExport: false,
  },
  PRO: {
    apiCallsPerMonth: 10000,
    copilotMessagesPerMonth: Number.POSITIVE_INFINITY,
    apiTypes: ["KYC", "AML", "OPEN_BANKING", "ACH", "SWIFT", "SEPA"],
    workspaces: 5,
    teamSeats: 3,
    complianceExport: true,
  },
  TEAM: {
    apiCallsPerMonth: 100000,
    copilotMessagesPerMonth: Number.POSITIVE_INFINITY,
    apiTypes: ["KYC", "AML", "OPEN_BANKING", "ACH", "SWIFT", "SEPA"],
    workspaces: Number.POSITIVE_INFINITY,
    teamSeats: 15,
    complianceExport: true,
    customScenarios: true,
  },
} as const;

export function normalizePlan(plan: Plan): keyof typeof PLAN_LIMITS {
  if (plan === "ENTERPRISE") return "TEAM";
  return plan;
}

export function canUseApiType(plan: Plan, apiType: ApiType): boolean {
  const limits = PLAN_LIMITS[normalizePlan(plan)];
  return (limits.apiTypes as readonly string[]).includes(apiType as unknown as string);
}

export function canExportCompliance(plan: Plan): boolean {
  return PLAN_LIMITS[normalizePlan(plan)].complianceExport;
}
