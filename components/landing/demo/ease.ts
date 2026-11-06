/**
 * SOURCE OF TRUTH KEYWORDS: easing, clamp, lerp, span, envelope, easeOutBack, keyframes, seeded random, hero film
 * WHAT:  The tiny math the hero film is drawn with: progress windows, easing curves, cursor paths, seeded noise.
 * WHY:   The scene is a pure function of time, so it needs these instead of an animation library or Math.random().
 * WHERE: components/landing/demo/*.
 */
export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Progress of `t` through [start, end], clamped to 0..1. */
export const span = (t: number, start: number, end: number) => clamp((t - start) / (end - start));

export const easeOut = (p: number) => 1 - (1 - p) ** 3;

export const easeInOut = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);

/** Ease out with a slight overshoot, for things that pop into place. */
export const easeOutBack = (p: number) => {
  const k = 1.6;
  return 1 + (k + 1) * (p - 1) ** 3 + k * (p - 1) ** 2;
};

/** 0 → 1 over [inStart, inEnd], then 1 → 0 over [outStart, outEnd]. */
export const envelope = (t: number, inStart: number, inEnd: number, outStart: number, outEnd: number) =>
  Math.min(easeOut(span(t, inStart, inEnd)), 1 - easeInOut(span(t, outStart, outEnd)));

/** Opacity and lift for something popping in at `at`. */
export const popIn = (t: number, at: number, ms = 520, lift = 24) => {
  const p = span(t, at, at + ms);
  return { opacity: easeOut(clamp(p * 1.6)), transform: `translateY(${(1 - easeOutBack(p)) * lift}px)` };
};

export type Keyframe = { t: number; x: number; y: number };

/** The point at `t` along `frames`, easing between each pair and holding the last. */
export function along(frames: ReadonlyArray<Keyframe>, t: number) {
  const next = frames.findIndex((f) => f.t > t);
  const i = next === -1 ? frames.length - 1 : Math.max(0, next - 1);
  const a = frames[i] ?? { t: 0, x: 0, y: 0 };
  const b = frames[i + 1] ?? a;
  const p = b === a ? 0 : easeInOut(span(t, a.t, b.t));
  return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) };
}

/** Deterministic numbers in [0, 1), so every render of a frame draws the same data. */
export function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable value in [0, 1) for a (seed, bucket) pair, for noise that changes every few frames. */
export const noise = (seed: number, bucket: number) => random(seed * 9973 + bucket)();
