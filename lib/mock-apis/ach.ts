import { randomUUID } from "crypto";

export interface AchResponse {
  transactionId: string;
  status: "initiated" | "pending" | "settled" | "returned" | "failed";
  returnCode?: string;
  settlementDate: string;
  amount: number;
  currency: "USD";
  tracingNumber: string;
}

export function generateAchResponse(mode: "success" | "failure" | "fraud", amount: number): AchResponse {
  if (mode === "failure") {
    return {
      transactionId: randomUUID(),
      status: "returned",
      returnCode: "R01",
      settlementDate: new Date(Date.now() + 86400000).toISOString(),
      amount,
      currency: "USD",
      tracingNumber: `${Math.floor(Math.random() * 1_000_000_000)}`,
    };
  }
  if (mode === "fraud") {
    return {
      transactionId: randomUUID(),
      status: "failed",
      returnCode: "R02",
      settlementDate: new Date(Date.now() + 86400000).toISOString(),
      amount,
      currency: "USD",
      tracingNumber: `${Math.floor(Math.random() * 1_000_000_000)}`,
    };
  }
  return {
    transactionId: randomUUID(),
    status: "settled",
    settlementDate: new Date(Date.now() + 86400000).toISOString(),
    amount,
    currency: "USD",
    tracingNumber: `${Math.floor(Math.random() * 1_000_000_000)}`,
  };
}
