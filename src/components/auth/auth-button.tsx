"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export function AuthButton() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-10 w-10",
            userButtonTrigger: "focus:shadow-none",
          },
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-4">
      <SignInButton
        mode="modal"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
      >
        <button className="text-sm font-medium hover:text-primary">
          ログイン
        </button>
      </SignInButton>
      <SignUpButton
        mode="modal"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
      >
        <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80">
          新規登録
        </button>
      </SignUpButton>
    </div>
  );
}
