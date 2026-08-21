export type CompliancePriority = "critical" | "high" | "medium";
export type ComplianceStatus = "pending" | "in_progress" | "complete";
export interface ComplianceItem { category: string; requirement: string; regulation: string; priority: CompliancePriority; status: ComplianceStatus }
interface Rules { licensing: string; aml: string; privacy: string; resilience: string; consumer: string }
const rulesByJurisdiction: Record<string, Rules> = {
  UK: { licensing: "FSMA 2000 Part 4A / FCA PERG", aml: "Money Laundering Regulations 2017", privacy: "UK GDPR Arts. 5, 25 & 32", resilience: "FCA PS21/3", consumer: "FCA Consumer Duty PRIN 2A" },
  EU: { licensing: "PSD2 Arts. 5–14", aml: "AMLD6 Directive (EU) 2018/1673", privacy: "GDPR Arts. 5, 25 & 32", resilience: "DORA Regulation (EU) 2022/2554", consumer: "PSD2 Arts. 44–57" },
  US: { licensing: "State MTL laws / 31 CFR 1010.100(ff)", aml: "Bank Secrecy Act / 31 CFR Chapter X", privacy: "GLBA Safeguards Rule / SEC Reg S-P", resilience: "FFIEC Business Continuity Handbook", consumer: "UDAAP / 12 USC 5531" },
  SG: { licensing: "Payment Services Act 2019", aml: "MAS Notice PSN01", privacy: "Personal Data Protection Act 2012", resilience: "MAS TRM Guidelines 2021", consumer: "MAS Fair Dealing Guidelines" },
  AU: { licensing: "Corporations Act 2001 / AFSL", aml: "AML/CTF Act 2006", privacy: "Privacy Act 1988 / APP 11", resilience: "APRA CPS 230", consumer: "ASIC Act 2001 ss12CA–12CC" },
};
const productItems: Record<string, Array<{ category: string; requirement: string; rule: keyof Rules; priority: CompliancePriority }>> = {
  Neobank: [{ category: "Safeguarding", requirement: "Segregate customer funds, reconcile daily, and document insolvency protection.", rule: "licensing", priority: "critical" }, { category: "Account Security", requirement: "Implement strong customer authentication, account recovery, and transaction alerts.", rule: "consumer", priority: "high" }],
  Lending: [{ category: "Credit Underwriting", requirement: "Document affordability, creditworthiness, adverse-action, and model-governance controls.", rule: "consumer", priority: "critical" }, { category: "Collections", requirement: "Implement fair-treatment, hardship, complaints, and collections oversight procedures.", rule: "consumer", priority: "high" }],
  Payments: [{ category: "Payment Security", requirement: "Apply strong authentication, fraud monitoring, and secure payment-initiation controls.", rule: "resilience", priority: "critical" }, { category: "Settlement", requirement: "Document safeguarding, reconciliation, settlement-finality, and exception handling.", rule: "licensing", priority: "high" }],
  Investment: [{ category: "Client Assets", requirement: "Segregate client assets and maintain custody, reconciliation, and disclosure controls.", rule: "licensing", priority: "critical" }, { category: "Suitability", requirement: "Capture client objectives and risk tolerance before recommendations or execution.", rule: "consumer", priority: "high" }],
  Insurance: [{ category: "Distribution", requirement: "Document product governance, suitability, disclosures, and distributor oversight.", rule: "licensing", priority: "critical" }, { category: "Claims", requirement: "Operate fair, timely, documented claims and complaints processes.", rule: "consumer", priority: "high" }],
};
export function generateComplianceChecklist(jurisdiction: string, productType: string): ComplianceItem[] {
  const rules = rulesByJurisdiction[jurisdiction] ?? rulesByJurisdiction.UK;
  const specifics = productItems[productType] ?? productItems.Neobank;
  const common: ComplianceItem[] = [
    { category: "Licensing", requirement: `Confirm permissions, regulatory perimeter, and responsible officers for a ${productType} operating in ${jurisdiction}.`, regulation: rules.licensing, priority: "critical", status: "pending" },
    { category: "AML & Sanctions", requirement: "Implement risk-based CDD, beneficial-owner verification, sanctions/PEP screening, monitoring, and suspicious-activity escalation.", regulation: rules.aml, priority: "critical", status: "pending" },
    { category: "Data Protection", requirement: "Document lawful bases, minimization, retention, data-subject rights, privacy-by-design, and breach response.", regulation: rules.privacy, priority: "high", status: "pending" },
    { category: "Operational Resilience", requirement: "Define impact tolerances, incident response, business continuity, testing, audit logs, and third-party risk controls.", regulation: rules.resilience, priority: "high", status: "pending" },
    { category: "Consumer Protection", requirement: "Provide clear disclosures, accessible complaints, fair outcomes monitoring, and vulnerable-customer support.", regulation: rules.consumer, priority: "high", status: "pending" },
  ];
  return [...common, ...specifics.map((item) => ({ category: item.category, requirement: item.requirement, regulation: rules[item.rule], priority: item.priority, status: "pending" as const }))];
}
