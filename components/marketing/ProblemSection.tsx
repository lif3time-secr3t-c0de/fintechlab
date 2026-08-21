import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function ProblemSection(): JSX.Element {
  const items = [
    "Real API access takes weeks — sandbox with mock KYC, ACH, Open Banking in seconds",
    "Compliance is a maze — jurisdiction-aware checklists for FCA, PSD2, SEC, MAS",
    "Your CFO doesn't exist yet — AI co-pilot stress-tests your business model",
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-8 text-3xl font-semibold">Why teams choose FintechLab</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <Card key={item}>
            <CardTitle>{index + 1}.</CardTitle>
            <CardDescription className="mt-2">{item}</CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
