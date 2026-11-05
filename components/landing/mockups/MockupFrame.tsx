import type { ReactNode } from "react";

/**
 * SOURCE OF TRUTH KEYWORDS: MockupFrame, product mockup, window chrome, card frame, glow, landing visual
 * WHAT:  The rounded, glowing window every landing mockup sits in, with an optional title bar.
 * WHY:   Keeps all product previews visually consistent with the call screen styling.
 * WHERE: components/landing/mockups/*.
 */
export default function MockupFrame({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-6 -z-10 rounded-full bg-primary-200/10 blur-3xl"
      />
      <div className="rounded-3xl border-gradient p-px shadow-2xl shadow-dark-100/60">
        <div className="rounded-3xl p-5 dark-gradient sm:p-6">
          {title && (
            <div className="mb-5 flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-light-800" />
              <span className="size-2.5 rounded-full bg-light-800" />
              <span className="size-2.5 rounded-full bg-light-800" />
              <span className="ml-2 text-xs text-light-400">{title}</span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
