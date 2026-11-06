import { heroFilm } from "@/constants/landing";
import type { ReactNode } from "react";
import { clamp, envelope, span } from "./ease";
import BrowserWindow from "./mock/BrowserWindow";
import Cursor from "./mock/Cursor";
import { STAGE, T, activeCaption, cursorAt, cursorKind, pressAt, screenAt } from "./script";
import CallScreen from "./screens/CallScreen";
import ReportScreen from "./screens/ReportScreen";
import SetupScreen from "./screens/SetupScreen";

const PATHS = {
  setup: "/interview",
  call: `/interview/${heroFilm.interviewId}`,
  report: `/interview/${heroFilm.interviewId}/feedback`,
} as const;

/**
 * SOURCE OF TRUTH KEYWORDS: Scene, hero film frame, pure function of time, wallpaper, screens, captions, cursor
 * WHAT:  Draws one frame of the hero film at STAGE size from `t` alone: wallpaper, browser, the current
 *        screen with cross-fades, the caption and the cursor.
 * WHY:   No timers or random numbers inside, so seeking, looping and reduced motion are always correct.
 * WHERE: components/landing/demo/Showcase.tsx.
 */
export default function Scene({ t, showCaption = true }: { t: number; showCaption?: boolean }) {
  const setup = t < T.backIn[0] ? 1 - span(t, T.toCall[0], T.toCall[1]) : span(t, T.backIn[0], T.backIn[1]);
  const call = envelope(t, T.toCall[0], T.toCall[1], T.toReport[0], T.toReport[1]);
  const report = envelope(t, T.toReport[0], T.toReport[1], T.out[0], T.out[1]);
  const cursor = cursorAt(t);
  const active = showCaption ? activeCaption(t) : null;
  // The wallpaper drifts slowly so the frame never feels frozen.
  const drift = Math.sin((t / 30_000) * Math.PI * 2);

  return (
    <div className="relative overflow-hidden bg-dark-100" style={{ width: STAGE.w, height: STAGE.h }}>
      {/* Wallpaper */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -left-40 -top-48 size-[640px] rounded-full bg-primary-200/25 blur-[120px]" style={{ transform: `translate(${drift * 40}px, ${drift * 20}px)` }} />
        <div className="absolute -bottom-56 -right-32 size-[620px] rounded-full bg-light-400/35 blur-[130px]" style={{ transform: `translate(${-drift * 30}px, ${-drift * 24}px)` }} />
        <div className="absolute bottom-0 left-1/3 size-[360px] rounded-full bg-success-100/[0.06] blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-light-800)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-light-800)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <BrowserWindow path={PATHS[screenAt(t)]} userImage="/user-avatar.png">
        <Layer opacity={setup}>
          <SetupScreen t={t} />
        </Layer>
        <Layer opacity={call}>
          <CallScreen t={t} />
        </Layer>
        <Layer opacity={report}>
          <ReportScreen t={t} />
        </Layer>
      </BrowserWindow>

      {active && (
        <div className="absolute inset-x-0 bottom-[22px] flex justify-center" style={{ opacity: active.opacity, transform: `translateY(${(1 - active.opacity) * 10}px)` }}>
          <p className="rounded-2xl bg-dark-100/45 px-6 py-2.5 text-[27px] font-semibold tracking-tight text-white shadow-[0_18px_40px_-12px] shadow-dark-100 ring-1 ring-inset ring-white/15 backdrop-blur-[14px] backdrop-saturate-[1.9]">
            {active.caption.words.map((word, i) => (
              <span key={`${i}-${word.text}`} style={{ opacity: t >= word.at ? 1 : 0.32 }}>
                {word.text}
                {i < active.caption.words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      <Cursor x={cursor.x} y={cursor.y} kind={cursorKind(t)} press={pressAt(t)} />
    </div>
  );
}

/** One screen inside the browser; hidden screens aren't rendered at all. */
function Layer({ opacity, children }: { opacity: number; children: ReactNode }) {
  if (opacity <= 0.001) return null;
  return (
    <div className="absolute inset-0" style={{ opacity, transform: `translateY(${(1 - clamp(opacity)) * 14}px) scale(${0.985 + 0.015 * opacity})` }}>
      {children}
    </div>
  );
}
