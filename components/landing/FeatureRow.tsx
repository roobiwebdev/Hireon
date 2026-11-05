import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

/**
 * SOURCE OF TRUTH KEYWORDS: FeatureRow, feature section, alternating layout, mockup slot, eyebrow, points
 * WHAT:  A text column next to a product mockup. `mockupSide` picks which side the mockup sits on.
 * WHY:   Every feature uses the same rhythm; the mockup is passed in as a slot so rows
 *        never hardcode their visuals.
 * WHERE: app/(marketing)/page.tsx, one per entry in `features`.
 */
export default function FeatureRow({
  eyebrow,
  title,
  body,
  points,
  mockup,
  mockupSide = "right",
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: ReadonlyArray<string>;
  mockup: ReactNode;
  mockupSide?: "left" | "right";
}) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={cn("flex flex-col gap-5", mockupSide === "left" && "lg:order-2")}>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-200">{eyebrow}</span>
        <h3 className="text-balance text-3xl font-semibold tracking-tight text-primary-100 sm:text-4xl">
          {title}
        </h3>
        <p className="text-pretty text-lg">{body}</p>
        <ul className="mt-1 flex list-none flex-col gap-2.5">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-3">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-200/15">
                <Check className="size-3 text-primary-200" aria-hidden />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.1} className={cn(mockupSide === "left" && "lg:order-1")}>
        {mockup}
      </Reveal>
    </div>
  );
}
