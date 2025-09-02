import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");
  const user = await getCurrentUser();

  return (
    <div
      className="root-layout"
      style={{
        fontFamily: user?.font ? (`var(${user.font})` as any) : undefined,
      }}
    >
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>

        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Settings" className="hover:opacity-80">
            <Settings className="size-8" />
          </Link>
          <Image
            src={
              user?.profileURL && user.profileURL !== ""
                ? user.profileURL
                : "/user-avatar.png"
            }
            alt="profile"
            width={45}
            height={45}
            className="rounded-full object-cover"
          />
        </div>
      </nav>

      {children}

      {/* Expose minimal user id to client settings page for uploads */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__USER_ID__ = ${JSON.stringify(user?.id || "")};`,
        }}
      />
    </div>
  );
};

export default Layout;
