import { NextResponse } from "next/server";
import { z } from "zod";
import { generateComplianceChecklist } from "@/lib/utils/compliance";
import { requireAppUser } from "@/lib/server/user";

const schema = z.object({
  jurisdiction: z.string().min(2),
  productType: z.string().min(2),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const payload = schema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "validation_error", message: payload.error.message }, { status: 400 });
    }
    return NextResponse.json(generateComplianceChecklist(payload.data.jurisdiction, payload.data.productType));
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
