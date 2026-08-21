export type Plan = "FREE" | "PRO" | "TEAM" | "ENTERPRISE";

export interface PlanUsage {
  apiCallsUsed: number;
  apiCallsLimit: number;
  copilotMessagesUsed: number;
  copilotMessagesLimit: number;
  workspacesUsed?: number;
  workspacesLimit?: number;
}
