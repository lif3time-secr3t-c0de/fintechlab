import { describe, expect, it } from "vitest";
import { canExportCompliance, canUseApiType, normalizePlan, PLAN_LIMITS } from "@/lib/utils/tier";

describe("plan enforcement", () => {
  it("restricts premium APIs on Free", () => {
    expect(canUseApiType("FREE", "KYC")).toBe(true);
    expect(canUseApiType("FREE", "AML")).toBe(false);
    expect(canExportCompliance("FREE")).toBe(false);
  });
  it("maps enterprise to team capabilities", () => {
    expect(normalizePlan("ENTERPRISE")).toBe("TEAM");
    expect(PLAN_LIMITS[normalizePlan("ENTERPRISE")].teamSeats).toBe(15);
  });
});
