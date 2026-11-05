import Faq from "@/components/landing/Faq";
import FeatureRow from "@/components/landing/FeatureRow";
import FinalCta from "@/components/landing/FinalCta";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import HistoryMockup from "@/components/landing/mockups/HistoryMockup";
import QuestionsMockup from "@/components/landing/mockups/QuestionsMockup";
import ScorecardMockup from "@/components/landing/mockups/ScorecardMockup";
import SectionHeading from "@/components/landing/SectionHeading";
import TechMarquee from "@/components/landing/TechMarquee";
import {
  demoInterview,
  faqs,
  feedbackCategories,
  features,
  finalCta,
  hero,
  marqueeTech,
  steps,
} from "@/constants/landing";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "HireonAI: practice job interviews out loud",
  description: hero.subtitle,
};

const categoryScores = feedbackCategories.map((name, i) => ({
  name,
  score: demoInterview.scores[i] ?? 0,
}));

const mockups: Record<(typeof features)[number]["id"], ReactNode> = {
  questions: (
    <QuestionsMockup
      role={demoInterview.role}
      level={demoInterview.level}
      type={demoInterview.type}
      techstack={demoInterview.techstack}
      questions={demoInterview.questions}
    />
  ),
  feedback: <ScorecardMockup totalScore={demoInterview.totalScore} categories={categoryScores} />,
  retake: <HistoryMockup items={demoInterview.history} />,
};

export default function LandingPage() {
  return (
    <>
      <Hero {...hero} demo={demoInterview} />
      <TechMarquee title="Practice for the stack you work in" tech={marqueeTech} />
      <HowItWorks steps={steps} />

      <section id="features" className="scroll-mt-28 px-4 py-24">
        <SectionHeading
          eyebrow="Features"
          title="Everything a practice round needs."
          body="Real questions, a real conversation, and a report you can act on."
        />
        <div className="mt-20 flex flex-col gap-28">
          {features.map((feature, i) => (
            <FeatureRow
              key={feature.id}
              eyebrow={feature.eyebrow}
              title={feature.title}
              body={feature.body}
              points={feature.points}
              mockup={mockups[feature.id]}
              mockupSide={i % 2 === 0 ? "right" : "left"}
            />
          ))}
        </div>
      </section>

      <Faq items={faqs} />
      <FinalCta {...finalCta} />
    </>
  );
}
