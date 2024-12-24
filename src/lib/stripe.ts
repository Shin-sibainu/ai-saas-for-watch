import Stripe from "stripe";

// クライアントサイドで使用する定数
export const STRIPE_PLANS = {
  STARTER: "price_1QZOG7BrtQokSzjSmgYZYCOG",
  PRO: "price_1QZOI0BrtQokSzjSmXtQloAP",
  ENTERPRISE: "price_1QZOIjBrtQokSzjSXwWIOc9C",
} as const;

// サーバーサイドでのみ使用するStripeインスタンス
export let stripe: Stripe | undefined;

export function getStripe() {
  if (typeof window !== "undefined") {
    throw new Error("This method can only be called on the server side");
  }

  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  }

  return stripe;
}
