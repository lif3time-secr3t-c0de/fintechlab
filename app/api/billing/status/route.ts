import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireAppUser } from "@/lib/server/user";

export async function GET(): Promise<Response> {
  try {
    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!user.stripeSubscriptionId) return NextResponse.json({ plan: user.plan, status: "free", periodEnd: null, nextAmount: 0 });
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: "missing_config", message: "Stripe not configured" }, { status: 503 });
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const item = subscription.items.data[0];
    return NextResponse.json({
      plan: user.plan,
      status: subscription.status,
      periodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
      nextAmount: item?.price.unit_amount ?? 0,
      currency: item?.price.currency ?? "usd",
    });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
