"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * SOURCE OF TRUTH KEYWORDS: MotionProvider, LazyMotion, MotionConfig, reduced motion, animation setup, m components
 * WHAT:  Loads the motion feature bundle lazily and applies the user's reduced-motion setting.
 * WHY:   `m.*` components stay tiny until this provider loads `domAnimation`, and
 *        `reducedMotion="user"` turns transform animations off for people who ask for that.
 * WHERE: app/(marketing)/layout.tsx. Wrap any route that uses components/motion/*.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
