import Reveal from "@/components/motion/Reveal";
import SectionHeading from "./SectionHeading";

/**
 * SOURCE OF TRUTH KEYWORDS: HowItWorks, steps, 01 02 03, numbered cards, process, onboarding flow
 * WHAT:  Three numbered step cards that reveal one after another.
 * WHY:   Explains the whole product loop (set up, talk, read the score) in one glance.
 * WHERE: app/(marketing)/page.tsx with `steps` from constants/landing.ts.
 */
export default function HowItWorks({
  steps,
}: {
  steps: ReadonlyArray<{ title: string; body: string }>;
}) {
  return (
    <section id="how-it-works" className="scroll-mt-28 px-4 py-24">
      <SectionHeading
        eyebrow="How it works"
        title="Three steps from nervous to ready."
        body="Set it up in a few taps, then have a real conversation out loud."
      />

      <ol className="mx-auto mt-14 grid max-w-6xl list-none gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="h-full">
            <Reveal
              delay={i * 0.12}
              className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-primary-200/10 p-7 dark-gradient transition-colors duration-300 hover:border-primary-200/30"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary-200/0 blur-3xl transition-colors duration-500 group-hover:bg-primary-200/15"
              />
              <span className="font-mono text-sm text-primary-200">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-xl font-semibold text-primary-100">{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
