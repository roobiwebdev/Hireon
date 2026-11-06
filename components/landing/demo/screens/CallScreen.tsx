import { demoInterview, heroFilm } from "@/constants/landing";
import { cn, getTechLogoUrl } from "@/lib/utils";
import { Mic } from "lucide-react";
import Image from "next/image";
import { clamp, easeOut, noise, span } from "../ease";
import { CALL, LIVE_BUTTONS_X, MAIN, T, callCaption, callPhase, spokenProgress, type CallPhase } from "../script";

const STATUS: Record<CallPhase, string | null> = {
  ready: null,
  connecting: "Connecting",
  speaking: "Interviewer is speaking",
  listening: "Listening. Answer out loud, then pause",
  thinking: "Thinking",
  scoring: "Scoring your answers",
};

const CARD_W = (MAIN.w - CALL.cardGap) / 2;

/** The film's call screen, mirroring components/call/CallView.tsx on /interview/[id]. */
export default function CallScreen({ t }: { t: number }) {
  const phase = callPhase(t);
  const speaking = phase === "speaking";
  const listening = phase === "listening";
  const live = phase === "speaking" || phase === "listening" || phase === "thinking";
  const caption = callCaption(t);

  return (
    <div className="absolute inset-0">
      {/* Interview header */}
      <div className="absolute inset-x-0 top-0 flex h-11 items-center gap-4">
        <Image src="/covers/spotify.png" alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
        <h3 className="text-[24px] font-semibold capitalize text-white">{demoInterview.role} Interview</h3>
        <div className="flex">
          {demoInterview.techstack.map((tech, i) => (
            <span key={tech} className={cn("flex size-9 items-center justify-center rounded-full bg-dark-300 ring-2 ring-dark-100", i > 0 && "-ml-2")}>
              <Image src={getTechLogoUrl(tech)} alt="" width={20} height={20} unoptimized />
            </span>
          ))}
        </div>
        <span className="ml-auto rounded-lg bg-dark-200 px-4 py-2 text-[15px] font-semibold text-light-100">{demoInterview.type}</span>
      </div>

      {/* AI interviewer */}
      <div
        className={cn(
          "absolute flex flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl blue-gradient-dark ring-2",
          speaking ? "ring-primary-200/70" : "ring-primary-200/25"
        )}
        style={{ left: 0, top: CALL.cardsY, width: CARD_W, height: CALL.cardsH }}
      >
        <div aria-hidden className="absolute inset-x-10 top-6 h-40 rounded-full bg-primary-200/10 blur-3xl" style={{ opacity: speaking ? 1 : 0.4 }} />
        <div className="relative flex size-[124px] items-center justify-center rounded-full blue-gradient">
          {speaking &&
            [0, 600].map((offset) => {
              const p = ((t + offset) % 1200) / 1200;
              return (
                <span
                  key={offset}
                  className="absolute inset-0 rounded-full bg-primary-200"
                  style={{ transform: `scale(${1 + easeOut(p) * 0.55})`, opacity: 0.45 * (1 - p) }}
                />
              );
            })}
          <Image src="/ai-avatar.png" alt="" width={70} height={58} className="relative" />
        </div>
        <p className="relative text-[24px] font-semibold text-primary-100">AI Interviewer</p>
        <Badge on={speaking} label="Speaking" />
      </div>

      {/* Candidate */}
      <div
        className="absolute rounded-2xl border-gradient p-0.5"
        style={{ left: CARD_W + CALL.cardGap, top: CALL.cardsY, width: CARD_W, height: CALL.cardsH }}
      >
        <div
          className={cn(
            "relative flex h-full flex-col items-center justify-center gap-5 rounded-2xl dark-gradient ring-inset",
            listening ? "ring-2 ring-success-100/60" : "ring-0"
          )}
        >
          <Image src="/user-avatar.png" alt="" width={124} height={124} className="size-[124px] rounded-full object-cover" />
          <p className="text-[24px] font-semibold text-primary-100">{heroFilm.candidate}</p>
          <div className="absolute bottom-6 flex h-6 items-end gap-1" style={{ opacity: listening ? 1 : 0 }}>
            {Array.from({ length: 9 }, (_, i) => {
              const level = listening ? 0.25 + 0.75 * noise(i + 1, Math.floor(t / 90)) : 0.2;
              return <span key={i} className="w-1 rounded-full bg-success-100" style={{ height: 24, transform: `scaleY(${level})`, transformOrigin: "bottom" }} />;
            })}
          </div>
          <Badge on={listening} label="Listening" tone="success" />
        </div>
      </div>

      {/* Caption, like CallView's transcript box */}
      <div className="absolute inset-x-0 rounded-2xl border-gradient p-0.5" style={{ top: CALL.captionY, height: CALL.captionH }}>
        <div className="flex h-full flex-col justify-center gap-1 rounded-2xl dark-gradient px-6">
          {caption ? (
            <>
              <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary-200">{caption.speaker}</span>
              <p className="truncate text-[19px] text-white" style={{ opacity: easeOut(span(t, caption.at, caption.at + 250)) }}>
                {caption.speaker === "Interviewer" ? <SpokenWords text={caption.text} progress={spokenProgress(t)} /> : caption.text}
              </p>
            </>
          ) : (
            <p className="text-center text-[17px] text-light-400">Press Call when you&apos;re ready. The interviewer speaks first.</p>
          )}
        </div>
      </div>

      <p className="absolute inset-x-0 text-center text-[15px] text-light-400" style={{ top: CALL.statusY }}>
        {STATUS[phase]}
      </p>

      {/* Controls */}
      <div className="absolute inset-x-0" style={{ top: CALL.buttonsY, height: CALL.buttonH }}>
        {live ? (
          <>
            <div
              className="absolute flex h-full items-center justify-center rounded-full text-[15px] font-bold text-primary-100 ring-1 ring-primary-200/40"
              style={{ left: LIVE_BUTTONS_X, width: CALL.doneW, opacity: listening ? 1 : 0.3 }}
            >
              I&apos;m done answering
            </div>
            <div
              className="absolute flex h-full items-center justify-center rounded-full bg-destructive-100 text-[15px] font-bold text-white"
              style={{
                left: LIVE_BUTTONS_X + CALL.doneW + 12,
                width: CALL.endW,
                transform: `scale(${1 - 0.05 * clamp(1 - Math.abs(t - T.end) / 160)})`,
              }}
            >
              End
            </div>
          </>
        ) : (
          <div
            className={cn(
              "absolute flex h-full items-center justify-center rounded-full text-[16px] font-bold text-white",
              phase === "scoring" ? "bg-success-100/40" : "bg-success-100"
            )}
            style={{ left: MAIN.w / 2 - CALL.callW / 2, width: CALL.callW, transform: `scale(${1 - 0.05 * clamp(1 - Math.abs(t - T.call) / 160)})` }}
          >
            {phase === "connecting" && (
              <span
                className="absolute inset-0 rounded-full bg-success-100"
                style={{ transform: `scale(${1 + ((t % 900) / 900) * 0.35})`, opacity: 0.5 * (1 - (t % 900) / 900) }}
              />
            )}
            <span className="relative">{phase === "connecting" ? ". . ." : phase === "scoring" ? "Done" : "Call"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ on, label, tone = "primary" }: { on: boolean; label: string; tone?: "primary" | "success" }) {
  return (
    <span
      className={cn(
        "absolute left-5 top-5 flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold",
        tone === "success" ? "bg-success-100/15 text-success-100" : "bg-primary-200/15 text-primary-100"
      )}
      style={{ opacity: on ? 1 : 0 }}
    >
      {tone === "success" ? <Mic className="size-3.5" aria-hidden /> : <span className="size-2 rounded-full bg-primary-200" />}
      {label}
    </span>
  );
}

/** Each word goes from dim to bright as the interviewer reaches it. */
function SpokenWords({ text, progress }: { text: string; progress: number }) {
  const words = text.split(" ");
  return words.map((word, i) => {
    const lit = clamp(progress * words.length - i);
    return (
      <span key={`${i}-${word}`} style={{ opacity: 0.32 + 0.68 * lit }}>
        {word}{" "}
      </span>
    );
  });
}
