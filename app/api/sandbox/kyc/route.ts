import { z } from "zod";
import { generateKycResponse } from "@/lib/mock-apis/kyc";
import { baseSandboxSchema, runSandboxRoute } from "@/lib/server/sandbox";

const schema = baseSandboxSchema.extend({
  customerId: z.string().min(1),
  country: z.string().min(2),
});

export async function POST(request: Request): Promise<Response> {
  return runSandboxRoute({
    request,
    apiType: "KYC",
    schema,
    generate: (_payload, mode, latencyMs) => generateKycResponse(mode, latencyMs),
  });
}
