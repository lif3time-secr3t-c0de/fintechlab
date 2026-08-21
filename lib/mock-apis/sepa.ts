import { randomUUID } from "crypto";

export function generateSepaResponse(mode: "success" | "failure" | "fraud", amount: number) {
  return {
    paymentId: randomUUID(),
    status: mode === "success" ? "booked" : mode === "failure" ? "rejected" : "pending_review",
    scheme: "SEPA Credit Transfer",
    creditorIban: "DE89370400440532013000",
    debtorIban: "FR7630006000011234567890189",
    amount,
    currency: "EUR",
    executionDate: new Date(Date.now() + 86400000).toISOString(),
  };
}
