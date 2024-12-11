import { getUserCredits } from "@/lib/user";

export async function CreditsDisplay() {
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
