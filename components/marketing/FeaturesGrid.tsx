import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const features = [
  "Mock APIs, real behavior — configurable latency, failure modes, fraud scenarios",
  "AI that knows fintech — not ChatGPT with a prompt, a domain-trained co-pilot",
  "Compliance, pre-built — export audit-ready documentation in one click",
  "Built for teams — workspaces, permissions, shared environments",
];

export function FeaturesGrid(): JSX.Element {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
      <h2 className="mb-8 text-3xl font-semibold">Features</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature}>
            <CardTitle>{feature.split("—")[0]}</CardTitle>
            <CardDescription className="mt-2">{feature}</CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
