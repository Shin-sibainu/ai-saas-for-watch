"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export async function createStripeSession(priceId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("認証が必要です");
    }

    // ユーザーのStripe顧客IDを取得または作成
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    let customerId = dbUser?.stripeCustomerId;

    if (!customerId) {
      // Stripe顧客を作成
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
        metadata: {
          clerkId: user.id,
        },
      });

      // ユーザーレコードを更新
      await prisma.user.update({
        where: { clerkId: user.id },
        data: { stripeCustomerId: customer.id },
      });

      customerId = customer.id;
    }

    // チェックアウトセッションを作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.BASE_URL}/dashboard/plan?canceled=true`,
      metadata: {
        clerkId: user.id,
      },
    });

    if (!session.url) {
      throw new Error("セッションの作成に失敗しました");
    }

    redirect(session.url);
  } catch (error) {
    console.error("Stripe session creation error:", error);
    throw new Error("決済の処理中にエラーが発生しました");
  }
} 