import { AuthButton } from "../auth/auth-button";
import { CreditsDisplay } from "./credits-display";
import { NavItems } from "./nav-items";
import { Button } from "../ui/button";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardNav() {
  const user = await currentUser();

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="grid items-start gap-2">
        <nav className="grid items-start gap-2">
          <NavItems />
        </nav>

        <div className="my-4 px-4 md:hidden">
          <AuthButton />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <CreditsDisplay />
        {user && (
          <Button asChild className="w-full" variant="premium">
            <Link href="/dashboard/plan">プランをアップグレード</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
