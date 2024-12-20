import { getUserCredits } from "@/lib/user";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { Loader2, Lock } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

async function CreditsContent() {
  const user = await currentUser();

  // 未ログインの場合
  if (!user) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="text-sm font-medium text-muted-foreground">
          残りクレジット
        </div>
        <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
          <Lock className="h-3 w-3" />
          <span>ログインが必要です</span>
        </div>
      </div>
    );
  }

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
