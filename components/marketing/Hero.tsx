import Link from "next/link";

export function Hero(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
        Build financial products without waiting for real bank access.
      </h1>
      <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
        FintechLab is the sandbox and AI co-pilot for fintech builders — mock APIs, compliance checks, and a financial advisor in one environment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/sign-up" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">Get early access →</Link>
        <Link href="/#features" className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted">See how it works</Link>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Trusted by early-stage fintech teams and developers</p>
    </section>
  );
}
