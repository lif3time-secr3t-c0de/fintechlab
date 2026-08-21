import { z } from "zod";
import { generateSwiftResponse } from "@/lib/mock-apis/swift";
import { baseSandboxSchema, runSandboxRoute } from "@/lib/server/sandbox";

const schema = baseSandboxSchema.extend({
  amount: z.number().positive(),
  currency: z.string().length(3),
  bicCode: z.string().min(8),
  iban: z.string().min(12),
});

export async function POST(request: Request): Promise<Response> {
  return runSandboxRoute({
    request,
    apiType: "SWIFT",
    schema,
    generate: (payload, mode) => generateSwiftResponse(mode, payload.amount),
  });
}
