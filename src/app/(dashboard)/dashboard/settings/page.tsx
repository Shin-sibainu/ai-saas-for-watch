import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ProfileSection } from "@/components/settings/profile-section";
import { SettingsForm } from "@/components/settings/settings-form";
import PageContainer from "@/components/dashboard/page-container";
import PageHeader from "@/components/dashboard/page-header";

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!dbUser) {
    throw new Error("ユーザーが見つかりません");
  }

  return (
    <PageContainer>
      <PageHeader
        title="設定"
        description="アカウントとサブスクリプションの設定を管理します"
      />
      <div className="max-w-2xl space-y-8">
        <div className="space-y-6">
          <ProfileSection
            email={user.emailAddresses[0].emailAddress}
            subscriptionStatus={dbUser.subscriptionStatus}
            nextBillingDate={dbUser.subscriptions[0]?.stripeCurrentPeriodEnd}
          />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">サブスクリプション管理</h2>
            <SettingsForm user={dbUser} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
