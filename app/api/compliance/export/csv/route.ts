import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/server/user";
import { canExportCompliance } from "@/lib/utils/tier";
import { generateComplianceChecklist } from "@/lib/utils/compliance";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!canExportCompliance(user.plan)) {
      return NextResponse.json({ error: "payment_required", message: "Compliance export is available on Pro and Team." }, { status: 402 });
    }

    const url = new URL(request.url);
    const jurisdiction = url.searchParams.get("jurisdiction") ?? "UK";
    const product = url.searchParams.get("product") ?? "Neobank";

    const items = generateComplianceChecklist(jurisdiction, product);

    // Build CSV
    const header = ["Category", "Requirement", "Regulation", "Priority", "Status"];
    const rows = items.map((it) => [it.category, it.requirement.replace(/\r?\n/g, " "), it.regulation, it.priority, it.status]);
    const csvLines = [header.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))];
    const csv = csvLines.join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="compliance-${jurisdiction.toLowerCase()}-${product.toLowerCase()}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "internal_error", message: String(err) }, { status: 500 });
  }
}
