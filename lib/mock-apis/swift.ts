import { randomUUID } from "crypto";

export function generateSwiftResponse(mode: "success" | "failure" | "fraud", amount: number) {
  return {
    transferId: randomUUID(),
    status: mode === "success" ? "accepted" : mode === "failure" ? "rejected" : "compliance_hold",
    mt103Reference: `MT103-${Math.floor(Math.random() * 1_000_000)}`,
    correspondentBank: "MOCKUS33XXX",
    settlementWindow: "T+2",
    amount,
    currency: "USD",
    charges: mode === "success" ? "SHA" : "OUR",
  };
}
