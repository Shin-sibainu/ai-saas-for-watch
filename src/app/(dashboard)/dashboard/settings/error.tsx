'use client';

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">エラーが発生しました</h2>
      <p className="text-muted-foreground">
        {error.message || "ページの読み込み中にエラーが発生しました。"}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>再試行</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          ページを更新
        </Button>
      </div>
    </div>
  );
} 