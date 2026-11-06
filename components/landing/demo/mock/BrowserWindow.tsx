import { Lock } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { MAIN, NAV_H, TITLE_H, WINDOW } from "../script";

/**
 * SOURCE OF TRUTH KEYWORDS: BrowserWindow, mock browser, URL bar, window chrome, app nav, hero film
 * WHAT:  A dark glass browser window on the stage showing hireon.roobi.dev, with Hireon's nav bar and a page area.
 * WHY:   Frames the film as a real session in the real web app, at the real domain.
 * WHERE: components/landing/demo/Scene.tsx.
 */
export default function BrowserWindow({
  path,
  userImage,
  children,
}: {
  path: string;
  userImage: string;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute overflow-hidden rounded-[18px] bg-dark-100/85 shadow-[0_40px_90px_-20px_rgb(0_0_0/0.85)] ring-1 ring-white/10 backdrop-blur-xl"
      style={{ left: WINDOW.x, top: WINDOW.y, width: WINDOW.w, height: WINDOW.h }}
    >
      {/* Title bar with the URL */}
      <div className="relative flex items-center border-b border-white/[0.06] bg-dark-300/60 px-5" style={{ height: TITLE_H }}>
        <div className="flex gap-2">
          <span className="size-3 rounded-full bg-destructive-100/80" />
          <span className="size-3 rounded-full bg-primary-200/70" />
          <span className="size-3 rounded-full bg-success-100/70" />
        </div>
        <div className="absolute left-1/2 flex h-7 w-[420px] -translate-x-1/2 items-center justify-center gap-2 rounded-lg bg-dark-100/70 text-[14px] text-light-400 ring-1 ring-white/[0.06]">
          <Lock className="size-3.5" aria-hidden />
          <span>
            <span className="text-light-100">hireon.roobi.dev</span>
            {path}
          </span>
        </div>
      </div>

      {/* Hireon's own nav bar */}
      <div className="flex items-center justify-between px-7" style={{ height: NAV_H }}>
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="" width={34} height={30} />
          <span className="text-[22px] font-semibold text-primary-100">HireonAI</span>
        </div>
        <Image src={userImage} alt="" width={34} height={34} className="size-[34px] rounded-full object-cover ring-2 ring-primary-200/30" />
      </div>

      {/* Ambient glow inside the app */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-primary-200/10 blur-3xl" />

      <div className="absolute" style={{ left: MAIN.x - WINDOW.x, top: MAIN.y - WINDOW.y, width: MAIN.w, height: MAIN.h }}>
        {children}
      </div>
    </div>
  );
}
