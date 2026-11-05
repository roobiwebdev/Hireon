"use client";

import { authClient } from "@/lib/auth/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

/**
 * SOURCE OF TRUTH KEYWORDS: SignOutButton, sign out, log out, end session, user menu
 * WHAT:  Ends the Better Auth session and returns to the landing page.
 * WHERE: app/(root)/layout.tsx navigation.
 */
export default function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const signOut = () =>
    startTransition(async () => {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error("Couldn't sign you out. Please try again.");
        return;
      }
      router.push("/");
      router.refresh();
    });

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="flex items-center gap-2 rounded-full border border-primary-200/15 px-4 py-2 text-sm text-light-100 transition-colors hover:border-primary-200/40 hover:text-primary-100 disabled:opacity-50"
    >
      <LogOut className="size-4" aria-hidden />
      {pending ? "Signing out" : "Sign out"}
    </button>
  );
}
