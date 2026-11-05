"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * SOURCE OF TRUTH KEYWORDS: CountUp, number counter, animated number, score counter, useInView, stat
 * WHAT:  Counts from 0 to `value` once the number scrolls into view.
 * WHY:   Scores and stats read as live data instead of static text. Shows the final
 *        number immediately when the user prefers reduced motion.
 * WHERE: components/landing/mockups/ScorecardMockup.tsx; reusable for dashboard stats.
 */
export default function CountUp({
  value,
  duration = 1.4,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
