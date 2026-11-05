import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import LiveCallMockup from "./mockups/LiveCallMockup";

type Cta = { label: string; href: string };

/**
 * SOURCE OF TRUTH KEYWORDS: Hero, landing hero, headline, primary cta, call mockup, above the fold
 * WHAT:  The first screen: eyebrow, headline, subhead, two CTAs, reassurance points, live call demo.
 * WHY:   Says what Hireon does in one line and shows it working before any scrolling.
 * WHERE: app/(marketing)/page.tsx with `hero` and `demoInterview` from constants/landing.ts.
 */
export default function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  points,
  demo,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  points: ReadonlyArray<string>;
  demo: {
    role: string;
    type: string;
    conversation: ReadonlyArray<{ speaker: "ai" | "user"; text: string }>;
  };
}) {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:pt-40">
      {/* Brand glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary-200/15 blur-[120px]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col items-center gap-7 text-center lg:items-start lg:text-left">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-200">
              <span className="size-1.5 rounded-full bg-success-100" />
              {eyebrow}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="text-balance bg-gradient-to-b from-primary-100 to-primary-200 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              {title}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="max-w-xl text-pretty text-lg sm:text-xl">{subtitle}</p>
          </Reveal>

          <Reveal delay={0.24} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild className="btn-primary min-h-12 px-7 text-base max-sm:w-full">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            <Button asChild className="btn-secondary min-h-12 px-7 text-base max-sm:w-full">
              <a href={secondaryCta.href}>{secondaryCta.label}</a>
            </Button>
          </Reveal>

          <Reveal delay={0.32}>
            <ul className="flex list-none flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-success-100" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="w-full">
          <LiveCallMockup role={demo.role} type={demo.type} conversation={demo.conversation} />
        </Reveal>
      </div>
    </section>
  );
}
