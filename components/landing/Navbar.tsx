"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/**
 * SOURCE OF TRUTH KEYWORDS: Navbar, marketing nav, sticky header, blurred pill, scroll state, landing navigation
 * WHAT:  Fixed pill-shaped navigation that tightens and blurs once the page scrolls.
 * WHY:   Keeps sign-in and the main CTA one click away on a long page.
 * WHERE: app/(marketing)/layout.tsx. Links come in as props from constants/landing.ts.
 */
export default function Navbar({
  links,
}: {
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Main"
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300",
          scrolled
            ? "border-primary-200/15 bg-dark-100/70 shadow-lg shadow-dark-100/40 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <Link href="/" className="flex items-center gap-2" aria-label="HireonAI home">
          <Image src="/logo.svg" alt="" width={30} height={26} priority />
          <span className="text-lg font-semibold text-primary-100">HireonAI</span>
        </Link>

        <ul className="hidden list-none items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-light-100 transition-colors hover:bg-primary-200/10 hover:text-primary-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="hidden rounded-full px-4 py-2 text-sm text-light-100 transition-colors hover:text-primary-100 sm:block"
          >
            Sign in
          </Link>
          <Button asChild className="btn-primary">
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
