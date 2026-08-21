import { z } from "zod";
import { generateAmlResponse } from "@/lib/mock-apis/aml";
import { baseSandboxSchema, runSandboxRoute } from "@/lib/server/sandbox";

const schema = baseSandboxSchema.extend({
  name: z.string().min(2),
  country: z.string().min(2),
});

export async function POST(request: Request): Promise<Response> {
  return runSandboxRoute({
    request,
    apiType: "AML",
    schema,
    generate: (_payload, mode) => generateAmlResponse(mode),
  });
}
