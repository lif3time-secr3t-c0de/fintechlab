import { z } from "zod";
import { generateOpenBankingResponse } from "@/lib/mock-apis/open-banking";
import { baseSandboxSchema, runSandboxRoute } from "@/lib/server/sandbox";

const schema = baseSandboxSchema.extend({
  institution: z.string().min(2),
  scopes: z.array(z.string()).min(1),
});

export async function POST(request: Request): Promise<Response> {
  return runSandboxRoute({
    request,
    apiType: "OPEN_BANKING",
    schema,
    generate: (_payload, mode) => generateOpenBankingResponse(mode),
  });
}
