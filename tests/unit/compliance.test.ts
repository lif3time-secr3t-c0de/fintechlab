import { describe, expect, it } from "vitest";
import { generateComplianceChecklist } from "@/lib/utils/compliance";

describe("compliance generator", () => {
  it.each(["UK", "EU", "US", "SG", "AU"])("generates complete %s requirements", (jurisdiction) => {
    const items = generateComplianceChecklist(jurisdiction, "Payments");
    expect(items.length).toBeGreaterThanOrEqual(7);
    expect(items.every((item) => item.regulation.length > 4)).toBe(true);
    expect(items.some((item) => item.category === "Payment Security")).toBe(true);
  });
});
