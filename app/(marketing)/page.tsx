import { FeaturesGrid } from "@/components/marketing/FeaturesGrid";
import { Hero } from "@/components/marketing/Hero";
import { PricingCards } from "@/components/marketing/PricingCards";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";

export default function MarketingPage(): JSX.Element {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <FeaturesGrid />
      <PricingCards />
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold">We&apos;re opening early access to the first 200 teams.</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join the waitlist and get 3 months of Pro free at launch.
        </p>
        <div className="mt-6">
          <WaitlistForm />
        </div>
      </section>
    </main>
  );
}
