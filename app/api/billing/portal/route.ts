import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireAppUser } from "@/lib/server/user";

export async function POST(): Promise<Response> {
  try {
    const stripe = await getStripe();
    if (!stripe) return NextResponse.json({ error: "missing_config", message: "Stripe API key not configured" }, { status: 500 });

    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: "missing_customer" }, { status: 400 });
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
