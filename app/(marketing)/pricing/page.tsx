import { PricingCards } from "@/components/marketing/PricingCards";

export default function PricingPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold">Pricing</h1>
      <p className="mb-8 text-muted-foreground">Choose the plan that matches your build stage.</p>
      <PricingCards />
    </main>
  );
}
