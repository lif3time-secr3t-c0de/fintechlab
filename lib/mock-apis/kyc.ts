import { randomUUID } from "crypto";

type CheckStatus = "pass" | "fail" | "pending";
type KycStatus = "approved" | "rejected" | "pending" | "manual_review";

export interface KycResponse {
  requestId: string;
  status: KycStatus;
  score: number;
  checks: {
    documentVerification: CheckStatus;
    facialMatch: CheckStatus;
    addressVerification: CheckStatus;
    sanctionsCheck: CheckStatus;
    pepCheck: CheckStatus;
  };
  riskLevel: "low" | "medium" | "high";
  flags: string[];
  processingTimeMs: number;
}

export function generateKycResponse(mode: "success" | "failure" | "fraud", latencyMs: number): KycResponse {
  if (mode === "failure") {
    return {
      requestId: randomUUID(),
      status: "rejected",
      score: 21,
      checks: {
        documentVerification: "fail",
        facialMatch: "pass",
        addressVerification: "fail",
        sanctionsCheck: "pass",
        pepCheck: "pass",
      },
      riskLevel: "high",
      flags: ["invalid_document", "address_mismatch"],
      processingTimeMs: latencyMs,
    };
  }

  if (mode === "fraud") {
    return {
      requestId: randomUUID(),
      status: "manual_review",
      score: 43,
      checks: {
        documentVerification: "pass",
        facialMatch: "fail",
        addressVerification: "pending",
        sanctionsCheck: "pass",
        pepCheck: "pass",
      },
      riskLevel: "high",
      flags: ["potential_identity_fraud"],
      processingTimeMs: latencyMs,
    };
  }

  return {
    requestId: randomUUID(),
    status: "approved",
    score: 92,
    checks: {
      documentVerification: "pass",
      facialMatch: "pass",
      addressVerification: "pass",
      sanctionsCheck: "pass",
      pepCheck: "pass",
    },
    riskLevel: "low",
    flags: [],
    processingTimeMs: latencyMs,
  };
}
