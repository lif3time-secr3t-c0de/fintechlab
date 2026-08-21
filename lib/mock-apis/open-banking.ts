import { randomUUID } from "crypto";

export function generateOpenBankingResponse(mode: "success" | "failure" | "fraud") {
  return {
    consentId: randomUUID(),
    status: mode === "success" ? "authorized" : mode === "failure" ? "denied" : "under_review",
    accounts: mode === "success" ? [{ id: "acc_001", type: "checking", balance: 15430.34, currency: "GBP" }] : [],
    institution: "Mock UK Bank",
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  };
}
