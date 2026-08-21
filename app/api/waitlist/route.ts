import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  company: z.string().optional(),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = schema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "validation_error", message: payload.error.message }, { status: 400 });
    }

    const entry = await prisma.waitlistEntry.upsert({
      where: { email: payload.data.email },
      update: { name: payload.data.name, company: payload.data.company },
      create: payload.data,
    });

    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ error: "missing_config", message: "Email service is not configured" }, { status: 503 });
    }
    const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "hello@fintechlab.tech",
        to: payload.data.email,
        subject: "You're on the FintechLab waitlist",
        text: "Thanks for joining. We'll invite you as soon as your spot opens.",
        html: "<h1>You're on the FintechLab waitlist</h1><p>Thanks for joining. We'll invite you as soon as your spot opens.</p>",
      });
    if (emailResult.error) {
      return NextResponse.json({ error: "email_failed", message: emailResult.error.message }, { status: 502 });
    }

    return NextResponse.json({ id: entry.id, email: entry.email });
  } catch (error) {
    return NextResponse.json({ error: "internal_error", message: String(error) }, { status: 500 });
  }
}
