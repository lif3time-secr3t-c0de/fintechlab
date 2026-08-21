import { randomUUID } from "crypto";

export interface AmlResponse {
  requestId: string;
  status: "clear" | "flagged" | "blocked";
  riskScore: number;
  matches: Array<{
    listName: string;
    matchType: "exact" | "fuzzy" | "alias";
    confidence: number;
  }>;
  transactionRisk: "low" | "medium" | "high" | "critical";
}

export function generateAmlResponse(mode: "success" | "failure" | "fraud"): AmlResponse {
  if (mode === "failure") {
    return {
      requestId: randomUUID(),
      status: "flagged",
      riskScore: 74,
      matches: [{ listName: "EU Sanctions", matchType: "fuzzy", confidence: 0.82 }],
      transactionRisk: "high",
    };
  }

  if (mode === "fraud") {
    return {
      requestId: randomUUID(),
      status: "blocked",
      riskScore: 97,
      matches: [
        { listName: "OFAC", matchType: "exact", confidence: 0.99 },
        { listName: "UN List", matchType: "alias", confidence: 0.91 },
      ],
      transactionRisk: "critical",
    };
  }

  return {
    requestId: randomUUID(),
    status: "clear",
    riskScore: 10,
    matches: [],
    transactionRisk: "low",
  };
}
