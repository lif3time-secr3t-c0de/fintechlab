"use client";

import { useMemo, useState } from "react";
import { ChecklistView } from "@/components/compliance/ChecklistView";
import { ExportButton } from "@/components/compliance/ExportButton";
import { JurisdictionSelector } from "@/components/compliance/JurisdictionSelector";
import { generateComplianceChecklist } from "@/lib/utils/compliance";

export default function CompliancePage(): JSX.Element {
  const [jurisdiction, setJurisdiction] = useState("UK");
  const [productType, setProductType] = useState("Neobank");

  const checklist = useMemo(
    () => generateComplianceChecklist(jurisdiction, productType),
    [jurisdiction, productType],
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Compliance</h2>
      <div className="flex flex-wrap items-center gap-2">
        <JurisdictionSelector value={jurisdiction} onChange={setJurisdiction} />
        <select
          aria-label="Product type"
          className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
          value={productType}
          onChange={(event) => setProductType(event.target.value)}
        >
          <option>Neobank</option>
          <option>Lending</option>
          <option>Payments</option>
          <option>Investment</option>
          <option>Insurance</option>
        </select>
        <ExportButton format="md" jurisdiction={jurisdiction} productType={productType} />
        <ExportButton format="pdf" jurisdiction={jurisdiction} productType={productType} />
        <ExportButton format="csv" jurisdiction={jurisdiction} productType={productType} />
      </div>
      <ChecklistView items={checklist} />
    </section>
  );
}
