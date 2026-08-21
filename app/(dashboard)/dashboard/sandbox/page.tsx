"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiSelector } from "@/components/sandbox/ApiSelector";
import { LogsTable } from "@/components/sandbox/LogsTable";
import { RequestBuilder } from "@/components/sandbox/RequestBuilder";
import { ResponseViewer } from "@/components/sandbox/ResponseViewer";
import { ScenarioConfig } from "@/components/sandbox/ScenarioConfig";
import { useSandbox } from "@/hooks/useSandbox";
import { UpgradeModal, type UpgradePrompt } from "@/components/billing/UpgradeModal";

interface LogItem {
  id: string;
  timestamp: string;
  apiType: string;
  status: number;
  latencyMs: number;
  requestBody?: string;
  responseBody?: string;
  pending?: boolean;
}

export default function SandboxPage(): JSX.Element {
  const sandbox = useSandbox();
  const [latency, setLatency] = useState(500);
  const [mode, setMode] = useState<"success" | "failure" | "fraud">("success");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePrompt | null>(null);

  async function runRequest(): Promise<void> {
    const started = Date.now();
    const logId = crypto.randomUUID();
    setLogs((previous) => [{ id: logId, timestamp: new Date().toISOString(), apiType: sandbox.apiType, status: 0, latencyMs: 0, requestBody: sandbox.requestBody, responseBody: "Waiting for response…", pending: true }, ...previous]);
    const result = await sandbox.sendRequest(latency, mode);
    if (result.status === 402 || result.status === 429) {
      setUpgradePrompt({
        limit: typeof result.payload.limit === "number" ? result.payload.limit : undefined,
        used: typeof result.payload.used === "number" ? result.payload.used : undefined,
        message: typeof result.payload.message === "string" ? result.payload.message : undefined,
      });
      return;
    }
    setLogs((previous) => previous.map((log) => log.id === logId ? { ...log, status: result.status, latencyMs: result.latencyMs || Date.now() - started, responseBody: JSON.stringify(result.payload, null, 2), pending: false } : log));
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">API Sandbox</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ApiSelector value={sandbox.apiType} onChange={sandbox.setApiType} />
          <ScenarioConfig latency={latency} onLatencyChange={setLatency} mode={mode} onModeChange={setMode} />
          <RequestBuilder value={sandbox.requestBody} onChange={sandbox.setRequestBody} />
          <Button onClick={() => void runRequest()} disabled={sandbox.loading}>
            {sandbox.loading ? "Sending..." : "Send request"}
          </Button>
        </div>
        <ResponseViewer body={sandbox.responseBody} statusCode={sandbox.statusCode} latencyMs={sandbox.latencyMs} />
      </div>
      <LogsTable logs={logs} />
      <UpgradeModal open={upgradePrompt !== null} onClose={() => setUpgradePrompt(null)} prompt={upgradePrompt} />
    </section>
  );
}
