"use client";

import CountUp from "@/components/motion/CountUp";
import { m } from "motion/react";
import MockupFrame from "./MockupFrame";

/**
 * SOURCE OF TRUTH KEYWORDS: ScorecardMockup, feedback preview, score bars, category scores, total score, count up
 * WHAT:  A feedback report preview: overall score plus one animated bar per scoring category.
 * WHY:   Makes the feedback tangible. Category names come from feedbackSchema via props,
 *        so the preview always matches what the real report scores.
 * WHERE: The "feedback" FeatureRow on app/(marketing)/page.tsx.
 */
export default function ScorecardMockup({
  totalScore,
  categories,
}: {
  totalScore: number;
  categories: ReadonlyArray<{ name: string; score: number }>;
}) {
  return (
    <MockupFrame title="Feedback report">
      <div className="flex items-end justify-between gap-4 border-b border-primary-200/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-light-400">Overall impression</p>
          <p className="mt-1 text-6xl font-semibold tracking-tight text-primary-100">
            <CountUp value={totalScore} />
            <span className="text-2xl text-light-400">/100</span>
          </p>
        </div>
        <span className="rounded-full bg-success-100/15 px-3 py-1 text-xs font-medium text-success-100">
          Ready for round two
        </span>
      </div>

      <ul className="mt-5 flex list-none flex-col gap-4">
        {categories.map((category, i) => (
          <li key={category.name}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-light-100">{category.name}</span>
              <CountUp value={category.score} className="tabular-nums text-primary-100" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-dark-300">
              <m.div
                className="h-full origin-left rounded-full bg-gradient-to-r from-primary-200/60 to-primary-200"
                style={{ width: `${category.score}%` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1.1, delay: 0.15 + i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              />
            </div>
          </li>
        ))}
      </ul>
    </MockupFrame>
  );
}
