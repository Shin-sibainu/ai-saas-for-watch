import { AuthButton } from "@/components/auth/auth-button";
import MobileNav from "@/components/dashboard/mobile-nav";
import DashboardNav from "@/components/dashboard/nav";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex items-center h-16 px-6">
          <MobileNav />

          <div className="flex w-full">
            <Link href="/">
              <h1 className="text-lg font-bold">AI Image Generator</h1>
            </Link>

            <div className="ml-auto hidden md:block">
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
