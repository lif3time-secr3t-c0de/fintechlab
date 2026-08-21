import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";
import { canUseApiType } from "@/lib/utils/tier";
import { getOrCreateUsage, getUsageLimits, incrementApiUsage } from "@/lib/utils/usage";
import type { ApiType } from "@/types/sandbox";

export const baseSandboxSchema = z.object({
  amount: z.number().optional(),
  currency: z.string().optional(),
  config: z
    .object({
      latencyMs: z.number().min(100).max(3000).optional(),
      mode: z.enum(["success", "failure", "fraud"]).optional(),
    })
    .optional(),
});

function monthResetAt(): string {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return next.toISOString();
}

export async function runSandboxRoute<T>({
  request,
  apiType,
  schema,
  generate,
}: {
  request: Request;
  apiType: ApiType;
  schema: z.ZodSchema<T>;
  generate: (payload: T, mode: "success" | "failure" | "fraud", latencyMs: number) => unknown;
}): Promise<NextResponse> {
  try {
    const user = await requireAppUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    if (!canUseApiType(user.plan, apiType)) {
      return NextResponse.json({ error: "payment_required", message: "This API is not available on your current plan." }, { status: 402 });
    }

    const usage = await getOrCreateUsage(user.id);
    const limits = getUsageLimits(user.plan);
    if (usage.apiCalls >= limits.apiCallsPerMonth) {
      return NextResponse.json(
        {
          error: "limit_exceeded",
          limit: limits.apiCallsPerMonth,
          used: usage.apiCalls,
          resetAt: monthResetAt(),
        },
        { status: 429 },
      );
    }

    const json = (await request.json()) as unknown;
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "validation_error", message: parsed.error.message }, { status: 400 });
    }
    const scenarioId = new URL(request.url).searchParams.get("scenarioId");
    let savedConfig: { latencyMs?: number; mode?: "success" | "failure" | "fraud" } | undefined;
    if (scenarioId) {
      const scenario = await prisma.sandboxScenario.findFirst({
        where: {
          id: scenarioId,
          apiType,
          workspace: { members: { some: { userId: user.id } } },
        },
        select: { config: true },
      });
      if (!scenario) return NextResponse.json({ error: "scenario_not_found" }, { status: 404 });
      const checkedConfig = baseSandboxSchema.shape.config.safeParse(scenario.config);
      if (!checkedConfig.success) return NextResponse.json({ error: "invalid_scenario_config" }, { status: 500 });
      savedConfig = checkedConfig.data;
    }

    const latencyMs = parsed.data && typeof parsed.data === "object" && parsed.data !== null && "config" in parsed.data
      ? savedConfig?.latencyMs ?? (parsed.data as { config?: { latencyMs?: number } }).config?.latencyMs ?? 500
      : 500;
    const mode = parsed.data && typeof parsed.data === "object" && parsed.data !== null && "config" in parsed.data
      ? savedConfig?.mode ?? (parsed.data as { config?: { mode?: "success" | "failure" | "fraud" } }).config?.mode ?? "success"
      : "success";

    await new Promise((resolve) => setTimeout(resolve, latencyMs));
    const responseBody = generate(parsed.data, mode, latencyMs);

    await incrementApiUsage(user.id);
    await prisma.apiLog.create({
      data: {
        userId: user.id,
        apiType,
        requestBody: parsed.data as object,
        responseBody: responseBody as object,
        statusCode: 200,
        latencyMs,
        scenarioId,
      },
    });

    return NextResponse.json(responseBody);
  } catch (error) {
    return NextResponse.json(
      { error: "internal_error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
