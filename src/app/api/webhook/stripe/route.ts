import { headers } from "next/headers";
import { getStripe, STRIPE_PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { Stripe } from "stripe";
import { SubscriptionStatus } from "@prisma/client";

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    if (!session?.subscription || !session?.metadata?.clerkId) {
      return new NextResponse(null, { status: 200 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription.toString()
    );

    // 初回サブスクリプション時のステータス更新のみ
    let subscriptionStatus: SubscriptionStatus = "FREE";
    switch (subscription.items.data[0].price.id) {
      case STRIPE_PLANS.STARTER:
        subscriptionStatus = "BASIC";
        break;
      case STRIPE_PLANS.PRO:
        subscriptionStatus = "PRO";
        break;
      case STRIPE_PLANS.ENTERPRISE:
        subscriptionStatus = "PRO";
        break;
    }

    // 初回はサブスクリプション情報の登録のみ
    await prisma.user.update({
      where: {
        clerkId: session.metadata.clerkId,
      },
      data: {
        subscriptionStatus: subscriptionStatus,
        subscriptions: {
          create: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
        },
      },
    });
  }

  // 毎月の更新時（初回決済を含む）にクレジットを付与
  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    let credits = 10;
    switch (subscription.items.data[0].price.id) {
      case STRIPE_PLANS.STARTER:
        credits = 50;
        break;
      case STRIPE_PLANS.PRO:
        credits = 120;
        break;
      case STRIPE_PLANS.ENTERPRISE:
        credits = 300;
        break;
    }

    // クレジットを更新
    await prisma.user.update({
      where: {
        stripeCustomerId: session.customer as string,
      },
      data: {
        credits: {
          increment: credits,
        },
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
