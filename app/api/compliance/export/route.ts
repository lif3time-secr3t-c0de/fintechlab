import { NextResponse } from "next/server";
import { Document, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { canExportCompliance } from "@/lib/utils/tier";
import { requireAppUser } from "@/lib/server/user";
import { generateComplianceChecklist } from "@/lib/utils/compliance";

function checklistMarkdown(jurisdiction: string, productType: string): string {
  const items = generateComplianceChecklist(jurisdiction, productType);
  const lines = [`# ${jurisdiction} ${productType} Compliance Checklist`, ""];
  for (const item of items) {
    lines.push(`- **${item.category}**: ${item.requirement} (${item.regulation}) [${item.priority}]`);
  }
  return lines.join("\n");
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!canExportCompliance(user.plan)) {
      return NextResponse.json({ error: "payment_required", message: "Compliance export is available on Pro and Team." }, { status: 402 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "md";
    const jurisdiction = url.searchParams.get("jurisdiction") ?? "UK";
    const productType = url.searchParams.get("product") ?? "Neobank";
    const markdown = checklistMarkdown(jurisdiction, productType);

    if (format === "md") {
      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": "attachment; filename=compliance.md",
        },
      });
    }

    const pdf = await renderToBuffer(
      createElement(
        Document,
        null,
        createElement(
          Page,
          { size: "A4", style: { padding: 24 } },
          createElement(
            View,
            null,
            createElement(Text, null, "Compliance Checklist"),
            createElement(Text, null, markdown),
          ),
        ),
      ),
    );
    const pdfArray = new Uint8Array(pdf as unknown as ArrayBufferLike);
    return new Response(pdfArray as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=compliance.pdf",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
