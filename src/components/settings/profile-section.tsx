interface ProfileSectionProps {
  email: string;
  subscriptionStatus: string;
  nextBillingDate?: Date;
}

export function ProfileSection({ email, subscriptionStatus, nextBillingDate }: ProfileSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">プロフィール</h2>
      <div className="grid gap-4 p-4 border rounded-lg">
        <div className="grid gap-1">
          <p className="text-sm font-medium">メールアドレス</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-medium">現在のプラン</p>
          <p className="text-sm text-muted-foreground">
            {subscriptionStatus === "FREE" && "無料プラン"}
            {subscriptionStatus === "BASIC" && "スタータープラン"}
            {subscriptionStatus === "PRO" && "プロプラン"}
          </p>
        </div>
        {nextBillingDate && (
          <div className="grid gap-1">
            <p className="text-sm font-medium">次回の更新日</p>
            <p className="text-sm text-muted-foreground">
              {nextBillingDate.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 