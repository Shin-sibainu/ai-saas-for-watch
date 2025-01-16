import { prisma } from "@/lib/prisma";
import { STRIPE_PLANS } from "@/lib/stripe";
import type { Stripe } from "stripe";
import { SubscriptionStatus } from "@prisma/client";

// プラン詳細を取得するヘルパー関数
export function getPlanDetails(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id;
  let status: SubscriptionStatus = "FREE";
  let credits = 10;

  switch (priceId) {
    case STRIPE_PLANS.STARTER:
      status = "BASIC";
      credits = 50;
      break;
    case STRIPE_PLANS.PRO:
      status = "PRO";
      credits = 120;
      break;
    case STRIPE_PLANS.ENTERPRISE:
      status = "PRO";
      credits = 300;
      break;
  }

  return { priceId, status, credits };
}

// サブスクリプション作成時の処理
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
) {
  const { priceId, status, credits } = getPlanDetails(subscription);

  return prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      subscriptionStatus: status,
      credits,
      subscriptions: {
        create: {
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      },
    },
  });
}

// サブスクリプション更新時の処理
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  // 期間終了時の解約予約も処理する
  if (subscription.status !== "active" && !subscription.cancel_at_period_end) return;

  const { priceId, status, credits } = getPlanDetails(subscription);

  return prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      // 解約予約されている場合は FREE に
      subscriptionStatus: subscription.cancel_at_period_end ? "FREE" : status,
      credits: subscription.cancel_at_period_end ? 10 : credits,
      subscriptions: {
        update: {
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        },
      },
    },
  });
}

// サブスクリプション削除時の処理
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  return prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      subscriptionStatus: "FREE",
      credits: 10,
      subscriptions: {
        delete: {
          stripeSubscriptionId: subscription.id,
        },
      },
    },
  });
}
