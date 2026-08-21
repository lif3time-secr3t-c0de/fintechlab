import { z } from "zod";
import { generateAchResponse } from "@/lib/mock-apis/ach";
import { baseSandboxSchema, runSandboxRoute } from "@/lib/server/sandbox";

const schema = baseSandboxSchema.extend({
  amount: z.number().positive(),
  accountNumber: z.string().min(4),
  routingNumber: z.string().min(4),
});

export async function POST(request: Request): Promise<Response> {
  return runSandboxRoute({
    request,
    apiType: "ACH",
    schema,
    generate: (payload, mode) => generateAchResponse(mode, payload.amount),
  });
}
