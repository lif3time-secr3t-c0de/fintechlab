export type ApiType = "KYC" | "AML" | "OPEN_BANKING" | "ACH" | "SWIFT" | "SEPA";

export interface SandboxScenarioConfig {
  latencyMs: number;
  mode: "success" | "failure" | "fraud";
}

export interface SandboxRequestBase {
  scenarioId?: string;
  config?: SandboxScenarioConfig;
}
