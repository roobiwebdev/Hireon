import { getCurrentUser } from "@/lib/auth/session";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary-200/15 blur-[120px]"
      />
      <header className="mx-auto flex max-w-6xl items-center px-4 pt-6">
        <Link href="/" className="flex items-center gap-2" aria-label="HireonAI home">
          <Image src="/logo.svg" alt="" width={30} height={26} />
          <span className="text-lg font-semibold text-primary-100">HireonAI</span>
        </Link>
      </header>
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
