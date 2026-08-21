import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const tiers = [
  { name: "Free", price: "$0", highlight: false, features: ["500 API calls/mo", "KYC, ACH, and Open Banking", "50 co-pilot messages", "1 workspace", "1 seat"] },
  { name: "Pro", price: "$49/mo", highlight: true, features: ["10,000 API calls/mo", "All six API sandboxes", "Unlimited co-pilot", "5 workspaces", "3 seats", "Compliance exports"] },
  { name: "Team", price: "$149/mo", highlight: false, features: ["100,000 API calls/mo", "All six API sandboxes", "Unlimited co-pilot", "Unlimited workspaces", "15 seats", "Custom scenarios"] },
];

export function PricingCards(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-8 text-3xl font-semibold">Pricing</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.highlight ? "border-primary" : ""}>
            <div className="flex items-center justify-between">
              <CardTitle>{tier.name}</CardTitle>
              {tier.highlight ? <Badge className="bg-primary text-primary-foreground">Recommended</Badge> : null}
            </div>
            <p className="mt-2 text-2xl font-bold">{tier.price}</p>
            <CardDescription className="mt-4">
              {tier.features.map((feature) => (
                <span key={feature} className="block">
                  • {feature}
                </span>
              ))}
            </CardDescription>
            <Link href={`/sign-up?plan=${tier.name.toUpperCase()}`} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
              {tier.name === "Free" ? "Start free" : `Choose ${tier.name}`}
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
