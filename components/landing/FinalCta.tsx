import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

/**
 * SOURCE OF TRUTH KEYWORDS: FinalCta, closing cta, bottom banner, sign up prompt, conversion section
 * WHAT:  The closing banner with one call to action.
 * WHY:   Gives readers who reached the end a single obvious next step.
 * WHERE: app/(marketing)/page.tsx with `finalCta` from constants/landing.ts.
 */
export default function FinalCta({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <section className="px-4 py-24">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary-200/20 px-6 py-16 blue-gradient-dark sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-200/20 blur-[100px]"
          />
          <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:justify-between">
            <div className="flex max-w-xl flex-col items-center gap-5 text-center lg:items-start lg:text-left">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-primary-100 sm:text-5xl">
                {title}
              </h2>
              <p className="text-lg">{body}</p>
              <Button asChild className="btn-primary min-h-12 px-7 text-base">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            </div>
            <Image src="/robot.png" alt="" width={320} height={320} className="max-lg:hidden" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
