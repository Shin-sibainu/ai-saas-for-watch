import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    const subscription = event.data.object as Stripe.Subscription;

    console.log("Stripe webhook event:", {
      type: event.type,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: subscription.current_period_end,
    });

    switch (event.type) {
      case "customer.subscription.created": {
        await handleSubscriptionCreated(subscription);
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(subscription);
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
