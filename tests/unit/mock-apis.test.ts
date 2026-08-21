import { describe, expect, it } from "vitest";
import { generateKycResponse } from "@/lib/mock-apis/kyc";
import { generateAchResponse } from "@/lib/mock-apis/ach";

describe("mock API generators", () => {
  it("produces deterministic scenario classes", () => {
    expect(generateKycResponse("success", 250).status).toBe("approved");
    expect(generateKycResponse("fraud", 250).riskLevel).toBe("high");
    expect(generateAchResponse("failure", 100).returnCode).toBe("R01");
  });
});
