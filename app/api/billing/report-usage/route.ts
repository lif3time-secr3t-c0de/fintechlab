import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

async function reportUsage(request: Request): Promise<Response> {
  try {
    if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: "missing_config" }, { status: 503 });
    const now = new Date();
    const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const month = `${previousMonth.getUTCFullYear()}-${String(previousMonth.getUTCMonth() + 1).padStart(2, "0")}`;
    const records = await prisma.usageRecord.findMany({ where: { month, apiCalls: { gt: 10000 }, user: { plan: "PRO", stripeCustomerId: { not: null } } }, include: { user: { select: { stripeCustomerId: true } } } });
    const eventName = process.env.STRIPE_METER_EVENT_NAME ?? "fintechlab_api_overage";
    await Promise.all(records.map((record) => stripe.billing.meterEvents.create({ event_name: eventName, payload: { stripe_customer_id: record.user.stripeCustomerId!, value: String(record.apiCalls - 10000) } })));
    return NextResponse.json({ month, reported: records.length });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request): Promise<Response> { return reportUsage(request); }
export async function POST(request: Request): Promise<Response> { return reportUsage(request); }
