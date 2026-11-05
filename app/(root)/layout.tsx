import SignOutButton from "@/components/SignOutButton";
import { requireUser } from "@/lib/auth/session";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const user = await requireUser();

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={38} height={32} />
          <h2 className="text-primary-100">HireonAI</h2>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 max-sm:hidden">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={32}
                height={32}
                unoptimized
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-200 text-sm font-bold text-dark-100">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-sm text-light-100">{user.name}</span>
          </div>
          <SignOutButton />
        </div>
      </nav>

      {children}
    </div>
  );
};

export default RootLayout;
