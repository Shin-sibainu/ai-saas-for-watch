import { getUserCredits } from "@/lib/user";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";

// クレジット表示の実際のコンポーネント
async function CreditsContent() {
  unstable_noStore();
  const credits = await getUserCredits();

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-sm font-medium text-muted-foreground">
        残りクレジット
      </div>
      <div className="mt-2 font-bold">{credits} クレジット</div>
    </div>
  );
}

// Suspenseでラップしたエクスポート用コンポーネント
export function CreditsDisplay() {
  return (
    <Suspense fallback={
      <div className="rounded-lg border bg-background p-4">
        <div className="text-sm font-medium text-muted-foreground">
          残りクレジット
        </div>
        <div className="mt-2 font-bold animate-pulse">読み込み中...</div>
      </div>
    }>
      <CreditsContent />
    </Suspense>
  );
}
