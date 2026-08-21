"use client";

import { useState } from "react";
import type { ApiType } from "@/types/sandbox";
import { capturePosthogEvent } from "@/lib/posthog";

const defaultPayloads: Record<ApiType, object> = {
  KYC: { customerId: "cust_001", country: "US" },
  AML: { name: "John Doe", country: "US" },
  ACH: { amount: 1000, accountNumber: "123456789", routingNumber: "021000021" },
  OPEN_BANKING: { institution: "chase", scopes: ["accounts", "transactions"] },
  SWIFT: { amount: 5000, currency: "USD", bicCode: "DEUTDEDB", iban: "DE89370400440532013000" },
  SEPA: { amount: 2500, currency: "EUR", iban: "DE89370400440532013000" },
};

export interface SandboxResult {
  status: number;
  payload: Record<string, unknown>;
  latencyMs: number;
}

export function useSandbox() {
  const [apiType, setApiType] = useState<ApiType>("KYC");
  const [requestBody, setRequestBody] = useState(JSON.stringify(defaultPayloads.KYC, null, 2));
  const [responseBody, setResponseBody] = useState("{}");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  function selectApiType(nextApiType: ApiType): void {
    setApiType(nextApiType);
    setRequestBody(JSON.stringify(defaultPayloads[nextApiType], null, 2));
    setResponseBody("{}");
    setStatusCode(null);
    setLatencyMs(null);
  }

  async function sendRequest(configuredLatencyMs: number, mode: "success" | "failure" | "fraud"): Promise<SandboxResult> {
    setLoading(true);
    const startedAt = Date.now();
    try {
      const parsedBody = JSON.parse(requestBody) as Record<string, unknown>;
      const response = await fetch(`/api/sandbox/${apiType.toLowerCase().replace("_", "-")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsedBody,
          config: { ...((parsedBody.config as object | undefined) ?? {}), latencyMs: configuredLatencyMs, mode },
        }),
      });
      const payload = await response.json();
      setResponseBody(JSON.stringify(payload, null, 2));
      setStatusCode(response.status);
      const durationMs = Date.now() - startedAt;
      setLatencyMs(durationMs);
      capturePosthogEvent("sandbox_request_sent", {
        apiType,
        statusCode: response.status,
        latencyMs: durationMs,
      });
      return { status: response.status, payload, latencyMs: durationMs };
    } catch (error) {
      capturePosthogEvent("sandbox_request_failed", {
        apiType,
        error: error instanceof Error ? error.message : "unknown_error",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    apiType,
    setApiType: selectApiType,
    requestBody,
    setRequestBody,
    responseBody,
    statusCode,
    latencyMs,
    loading,
    sendRequest,
  };
}
