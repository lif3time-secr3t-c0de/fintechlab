import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request): Promise<Response> {
  try {
    const stripe = await getStripe();
    if (!stripe) return NextResponse.json({ error: "missing_config", message: "Stripe API key not configured" }, { status: 500 });

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "missing_signature" }, { status: 400 });
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = String(session.customer);
      const plan = session.metadata?.plan === "TEAM" ? "TEAM" : "PRO";
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan,
          stripeSubscriptionId: session.subscription ? String(session.subscription) : undefined,
        },
      });
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = String(subscription.customer);
      const active = subscription.status === "active" || subscription.status === "trialing";
      const plan = active
        ? subscription.metadata?.plan === "TEAM" || subscription.items.data[0]?.price.id === process.env.STRIPE_TEAM_PRICE_ID
          ? "TEAM"
          : "PRO"
        : "FREE";

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan,
          stripeSubscriptionId: active ? subscription.id : null,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "webhook_error", message: String(error) }, { status: 400 });
  }
}
