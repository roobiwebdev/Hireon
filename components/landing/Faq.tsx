import Reveal from "@/components/motion/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SectionHeading from "./SectionHeading";

/**
 * SOURCE OF TRUTH KEYWORDS: Faq, questions, accordion, frequently asked, landing faq, answers
 * WHAT:  The FAQ section as a single-open accordion.
 * WHY:   Answers the obvious objections (install, scoring, retakes) without a support page.
 * WHERE: app/(marketing)/page.tsx with `faqs` from constants/landing.ts.
 */
export default function Faq({
  items,
}: {
  items: ReadonlyArray<{ question: string; answer: string }>;
}) {
  return (
    <section id="faq" className="scroll-mt-28 px-4 py-24">
      <SectionHeading eyebrow="Questions" title="Things people ask first." />
      <Reveal className="mx-auto mt-12 max-w-3xl">
        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {items.map((item) => (
            <AccordionItem
              key={item.question}
              value={item.question}
              className="rounded-2xl border border-primary-200/10 bg-dark-200/40 px-5 last:border-b data-[state=open]:border-primary-200/30"
            >
              <AccordionTrigger className="py-5 text-base text-primary-100 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base text-light-100">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
