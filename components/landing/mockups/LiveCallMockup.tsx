"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Line = { speaker: "ai" | "user"; text: string };

const TYPE_MS = 28;
const HOLD_MS = 1800;
const REDUCED_HOLD_MS = 4000;
const BARS = [0.55, 0.9, 0.4, 1, 0.65, 0.85, 0.45];

const formatClock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * SOURCE OF TRUTH KEYWORDS: LiveCallMockup, call demo, hero animation, typing caption, waveform, speaking pulse
 * WHAT:  A looping, scripted preview of a Hireon voice interview: speaker cards, live caption, timer.
 * WHY:   Shows the product working in the first screen without a video. It mirrors the real
 *        call screen (components/Agent.tsx) and only animates while it is on screen.
 * WHERE: components/landing/Hero.tsx. Script comes from demoInterview in constants/landing.ts.
 */
export default function LiveCallMockup({
  role,
  type,
  conversation,
}: {
  role: string;
  type: string;
  conversation: ReadonlyArray<Line>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20px" });
  const reduceMotion = useReducedMotion();

  const [lineIndex, setLineIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const [seconds, setSeconds] = useState(252);

  const line = conversation[lineIndex % conversation.length];
  const fullText = line?.text ?? "";
  const typing = !reduceMotion && chars < fullText.length;
  const shownText = reduceMotion ? fullText : fullText.slice(0, chars);
  const aiSpeaking = line?.speaker === "ai";
  const questionNumber =
    conversation.slice(0, (lineIndex % conversation.length) + 1).filter((l) => l.speaker === "ai")
      .length;
  const questionTotal = conversation.filter((l) => l.speaker === "ai").length;

  // Type the current line, hold it, then move on. Paused while off screen.
  useEffect(() => {
    if (!inView || !line) return;
    if (typing) {
      const id = setTimeout(() => setChars((c) => c + 1), TYPE_MS);
      return () => clearTimeout(id);
    }
    const id = setTimeout(
      () => {
        setLineIndex((i) => (i + 1) % conversation.length);
        setChars(0);
      },
      reduceMotion ? REDUCED_HOLD_MS : HOLD_MS
    );
    return () => clearTimeout(id);
  }, [inView, line, typing, reduceMotion, conversation.length]);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-3xl border border-primary-200/15 bg-dark-100/70 p-4 shadow-2xl shadow-primary-200/10 backdrop-blur-xl sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-light-100">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive-100 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-destructive-100" />
          </span>
          <span className="font-medium text-primary-100">Live</span>
          <span className="tabular-nums">{formatClock(seconds)}</span>
        </div>
        <span className="truncate rounded-full border border-primary-200/15 bg-dark-200 px-3 py-1 text-xs text-light-100">
          {role} · {type}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div
          className={cn(
            "flex flex-col items-center gap-3 rounded-2xl border p-4 blue-gradient-dark transition-colors duration-500 sm:p-6",
            aiSpeaking ? "border-primary-200/50" : "border-primary-200/15"
          )}
        >
          <div className="relative flex size-16 items-center justify-center rounded-full blue-gradient sm:size-20">
            {aiSpeaking && (
              <span className="absolute inline-flex size-5/6 animate-ping rounded-full bg-primary-200 opacity-60 motion-reduce:animate-none" />
            )}
            <Image src="/ai-avatar.png" alt="" width={44} height={37} className="relative z-10 object-cover" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-primary-100">AI Interviewer</p>
            <p className="text-xs">{aiSpeaking ? "Speaking" : "Listening"}</p>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col items-center gap-3 rounded-2xl border p-4 dark-gradient transition-colors duration-500 sm:p-6",
            aiSpeaking ? "border-light-800" : "border-success-100/40"
          )}
        >
          <Image
            src="/user-avatar.png"
            alt=""
            width={80}
            height={80}
            className="size-16 rounded-full object-cover sm:size-20"
          />
          <div className="flex h-[38px] items-center gap-1" aria-hidden>
            {BARS.map((peak, i) => (
              <m.span
                key={i}
                className="block h-6 w-1 origin-center rounded-full bg-success-100"
                animate={aiSpeaking ? { scaleY: 0.15 } : { scaleY: [0.2, peak, 0.35, peak * 0.8, 0.2] }}
                transition={
                  aiSpeaking
                    ? { duration: 0.3 }
                    : { duration: 0.9 + i * 0.08, repeat: Infinity, ease: "easeInOut" }
                }
              />
            ))}
          </div>
          <p className="-mt-2 text-center font-semibold text-primary-100">You</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border-gradient p-px">
        <div className="min-h-[104px] rounded-2xl px-5 py-4 dark-gradient" aria-live="off">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={lineIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary-200">
                {aiSpeaking ? "Interviewer" : "You"}
              </p>
              <p className="text-base text-primary-100 sm:text-lg">
                {shownText}
                {typing && (
                  <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-primary-200" />
                )}
              </p>
            </m.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-light-400">
        <span>
          Question {questionNumber} of {questionTotal}
        </span>
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: questionTotal }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i < questionNumber ? "w-6 bg-primary-200" : "w-1.5 bg-light-800"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
