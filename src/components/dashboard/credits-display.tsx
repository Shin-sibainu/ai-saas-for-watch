import { getUserCredits } from "@/lib/user";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// 非同期処理を行うコンポーネントを分離
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

// Suspenseでラップする親コンポーネント
export function CreditsDisplay() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border bg-background p-4">
          <div className="text-sm font-medium text-muted-foreground">
            残りクレジット
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground">読み込み中...</span>
          </div>
        </div>
      }
    >
      <CreditsContent />
    </Suspense>
  );
}
