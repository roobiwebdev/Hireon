"use client";

import { useSyncExternalStore } from "react";

type Tick = (now: number) => void;
const ticks = new Set<Tick>();
let frame = 0;

function run(now: number) {
  for (const tick of ticks) tick(now);
  frame = ticks.size ? requestAnimationFrame(run) : 0;
}

/**
 * SOURCE OF TRUTH KEYWORDS: onFrame, requestAnimationFrame, shared rAF loop, whileVisible, visibility clock, reduced motion
 * WHAT:  One requestAnimationFrame loop for the whole page, plus a clock that only ticks while an element is on screen.
 * WHY:   Every landing animation shares a single loop, and nothing animates off screen or in a hidden tab.
 * WHERE: components/landing/demo/usePlayer.ts.
 */
export function onFrame(tick: Tick) {
  ticks.add(tick);
  frame ||= requestAnimationFrame(run);
  return () => {
    ticks.delete(tick);
  };
}

/** Calls `tick` with the milliseconds since the last frame (at most 100) while ≥ 35% of `node` is visible. */
export function whileVisible(node: Element, tick: (dt: number) => void, threshold = 0.35) {
  let intersecting = false;
  let stop: (() => void) | undefined;
  const update = () => {
    stop?.();
    stop = undefined;
    if (!intersecting || document.hidden) return;
    let last = performance.now();
    stop = onFrame((now) => {
      tick(Math.min(100, Math.max(0, now - last)));
      last = now;
    });
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      intersecting = entry?.isIntersecting ?? false;
      update();
    },
    { threshold }
  );
  observer.observe(node);
  document.addEventListener("visibilitychange", update);
  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", update);
    stop?.();
  };
}

const REDUCED = "(prefers-reduced-motion: reduce)";

/** True when the visitor asked the OS for less motion. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false
  );
}
