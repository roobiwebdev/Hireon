"use client";

import { m } from "motion/react";
import MockupFrame from "./MockupFrame";

const list = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, x: -12 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

/**
 * SOURCE OF TRUTH KEYWORDS: QuestionsMockup, generated questions, interview setup, role chips, stagger list
 * WHAT:  A preview of an interview's setup (role, level, type, stack) and its generated questions.
 * WHY:   Shows that questions are tailored. Questions appear one by one when scrolled into view.
 * WHERE: The "questions" FeatureRow on app/(marketing)/page.tsx.
 */
export default function QuestionsMockup({
  role,
  level,
  type,
  techstack,
  questions,
}: {
  role: string;
  level: string;
  type: string;
  techstack: ReadonlyArray<string>;
  questions: ReadonlyArray<string>;
}) {
  return (
    <MockupFrame title="New interview">
      <div className="flex flex-wrap gap-2">
        {[role, level, type].map((chip) => (
          <span key={chip} className="rounded-full bg-primary-200/15 px-3 py-1 text-xs font-medium text-primary-200">
            {chip}
          </span>
        ))}
        {techstack.map((tech) => (
          <span key={tech} className="rounded-full border border-primary-200/15 px-3 py-1 text-xs text-light-100">
            {tech}
          </span>
        ))}
      </div>

      <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-widest text-light-400">
        {questions.length} questions ready
      </p>
      <m.ol
        className="flex list-none flex-col gap-2"
        variants={list}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-60px" }}
      >
        {questions.map((question, i) => (
          <m.li
            key={question}
            variants={item}
            className="flex gap-3 rounded-2xl border border-primary-200/10 bg-dark-200/50 p-3"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-dark-300 font-mono text-xs text-primary-200">
              {i + 1}
            </span>
            <span className="text-sm text-primary-100">{question}</span>
          </m.li>
        ))}
      </m.ol>
    </MockupFrame>
  );
}
