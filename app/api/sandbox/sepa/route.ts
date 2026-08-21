import { z } from "zod";
import { generateSepaResponse } from "@/lib/mock-apis/sepa";
import { baseSandboxSchema, runSandboxRoute } from "@/lib/server/sandbox";

const schema = baseSandboxSchema.extend({
  amount: z.number().positive(),
  currency: z.string().length(3),
  iban: z.string().min(12),
});

export async function POST(request: Request): Promise<Response> {
  return runSandboxRoute({
    request,
    apiType: "SEPA",
    schema,
    generate: (payload, mode) => generateSepaResponse(mode, payload.amount),
  });
}
