import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/**
 * SOURCE OF TRUTH KEYWORDS: SectionHeading, eyebrow, section title, h2, landing heading, align
 * WHAT:  Eyebrow label + sentence-case heading + optional intro paragraph for a landing section.
 * WHY:   Every section opens the same way, so spacing and type scale stay consistent.
 * WHERE: components/landing/* sections.
 */
export default function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left"
      )}
    >
      <span className="rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-200">
        {eyebrow}
      </span>
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-primary-100 sm:text-5xl">
        {title}
      </h2>
      {body && <p className="text-pretty text-lg">{body}</p>}
    </Reveal>
  );
}
