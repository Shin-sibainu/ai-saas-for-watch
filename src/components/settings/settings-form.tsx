"use client";

import { Button } from "@/components/ui/button";
import { User, Subscription } from "@prisma/client";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  user: User & {
    subscriptions: Subscription[];
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      });
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="grid gap-4 p-4 border rounded-lg">
      <div className="grid gap-2">
        {user?.subscriptionStatus !== "FREE" ? (
          <>
            <p className="text-sm text-muted-foreground">
              現在のサブスクリプションを管理します。
            </p>
            <Button onClick={handleManageSubscription}>
              サブスクリプションを管理
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              まだサブスクリプションに登録していません。
            </p>
            <Button onClick={() => router.push("/dashboard/plan")}>
              プランをアップグレード
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
