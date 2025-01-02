import { PlanClient } from "./plan-client";
import { use } from "react";

export default function PlanPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const params = use(Promise.resolve(searchParams));

  return (
    <div className="container py-8 mx-auto">
      {params?.reason === "insufficient_credits" && (
        <div className="mb-8 rounded-lg border bg-destructive/10 p-4 text-destructive">
          <h2 className="text-lg font-semibold">クレジットが不足しています</h2>
          <p>
            画像生成を続けるには、プランをアップグレードするかクレジットを購入してください。
          </p>
        </div>
      )}
      <PlanClient />
    </div>
  );
}
