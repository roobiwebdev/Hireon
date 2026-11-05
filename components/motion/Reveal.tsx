"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";

/**
 * SOURCE OF TRUTH KEYWORDS: Reveal, scroll reveal, fade up, whileInView, entrance animation, stagger delay
 * WHAT:  Fades and lifts its children into place the first time they scroll into view.
 * WHY:   One entrance animation for every section keeps timing consistent across the page.
 * WHERE: Landing sections (components/landing/*). Needs MotionProvider above it.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </m.div>
  );
}
