import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";

const schema = z.object({
  plan: z.enum(["PRO", "TEAM"]),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const stripe = await getStripe();
    if (!stripe) return NextResponse.json({ error: "missing_config", message: "Stripe not configured" }, { status: 500 });

    const user = await requireAppUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const payload = schema.safeParse(await request.json());
    if (!payload.success) return NextResponse.json({ error: "validation_error" }, { status: 400 });

    const priceId = payload.data.plan === "PRO"
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_TEAM_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "missing_config", message: "Stripe not configured" }, { status: 500 });
    }

    const customerId =
      user.stripeCustomerId ??
      (
        await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        })
      ).id;

    if (!user.stripeCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { plan: payload.data.plan, userId: user.id },
      subscription_data: { metadata: { plan: payload.data.plan, userId: user.id } },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
