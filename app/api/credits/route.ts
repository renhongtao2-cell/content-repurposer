import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" as any }) : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment system not configured. Contact admin." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { credits } = body || {};

    if (!credits || credits < 1) {
      return NextResponse.json({ error: "Credits must be >= 1" }, { status: 400 });
    }

    // Pricing tiers (in cents)
    let amount: number;
    if (credits <= 5) {
      amount = 200; // $2.00
    } else if (credits <= 30) {
      amount = 800; // $8.00
    } else {
      amount = 1500; // $15.00
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ContentRepurposer - ${credits} Credit${credits > 1 ? "s" : ""}`,
              description: `Generate ${credits} social media content repurposes`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?payment=cancelled`,
      metadata: { credits: String(credits) },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
