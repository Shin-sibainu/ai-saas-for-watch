"use client";

import { Check, Sparkles, Rocket, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STRIPE_PLANS } from "@/lib/stripe";
import { createStripeSession } from "@/actions/stripe";
import { useActionState } from "react";
import { StripeState } from "@/types/stripe";

const plans = [
  {
    name: "Starter",
    icon: Sparkles,
    price: "¥1,000",
    description: "個人利用に最適なエントリープラン",
    features: [
      "月50クレジット付与",
      "基本的な画像生成",
      "標準解像度 (512x512)",
      "基本的なスタイル選択",
      "メールサポート",
    ],
    buttonText: "Starterプランを選択",
    priceId: STRIPE_PLANS.STARTER,
    color: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
    hoverColor: "hover:shadow-blue-500/10",
  },
  {
    name: "Pro",
    icon: Rocket,
    price: "¥2,000",
    description: "プロフェッショナルな制作活動に",
    features: [
      "月120クレジット付与",
      "高度な画像生成",
      "高解像度対応 (1024x1024)",
      "優先サポート",
      "商用利用可能",
      "カスタムスタイル作成",
    ],
    buttonText: "Proプランを選択",
    priceId: STRIPE_PLANS.PRO,
    popular: true,
    color: "bg-gradient-to-r from-violet-500/10 to-purple-500/10",
    hoverColor: "hover:shadow-purple-500/10",
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "¥5,000",
    description: "ビジネス向けの完全なソリューション",
    features: [
      "月300クレジット付与",
      "最高品質の画像生成",
      "超高解像度対応 (2048x2048)",
      "24時間優先サポート",
      "API利用可能",
      "カスタマイズ機能",
      "専任サポート担当者",
      "SLA保証",
    ],
    buttonText: "Enterpriseプランを選択",
    priceId: STRIPE_PLANS.ENTERPRISE,
    color: "bg-gradient-to-r from-orange-500/10 to-amber-500/10",
    hoverColor: "hover:shadow-amber-500/10",
  },
];

const initialState: StripeState = {
  status: "idle",
  error: "",
};

export function PlanClient() {
  const [state, formAction] = useActionState(createStripeSession, initialState);

  // リダイレクト処理
  if (state.status === "success" && state.redirectUrl) {
    window.location.href = state.redirectUrl;
  }

  return (
    <>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          料金プラン
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          あなたのニーズに合わせて最適なプランをお選びください
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`rounded-xl border bg-card p-8 shadow-sm transition-all flex flex-col ${
                plan.hoverColor
              } ${plan.color} ${
                plan.popular ? "ring-2 ring-primary scale-105" : ""
              }`}
            >
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  {plan.popular && (
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary w-fit">
                      人気プラン
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-2 text-muted-foreground">/月</span>
                </div>

                <ul className="space-y-4 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <form action={formAction}>
                <input type="hidden" name="priceId" value={plan.priceId} />
                <Button
                  type="submit"
                  className="w-full mt-8"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </form>
            </div>
          );
        })}
      </div>
    </>
  );
}
