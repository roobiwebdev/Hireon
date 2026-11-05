"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * SOURCE OF TRUTH KEYWORDS: CallView, call screen, interviewer card, live caption, call controls, end call
 * WHAT:  The interview call screen: interviewer and candidate cards, the caption, a status line and the controls.
 * WHY:   Presentation only, so both voice engines (Vapi, browser) render the same UI from InterviewCallState.
 * WHERE: components/Agent.tsx.
 */
export default function CallView({
  call,
  userName,
  userImage,
  scoring,
  scoreFailed = false,
  onRetryScoring,
}: {
  call: InterviewCallState;
  userName: string;
  userImage?: string | null;
  scoring: boolean;
  scoreFailed?: boolean;
  onRetryScoring?: () => void;
}) {
  const { status, aiSpeaking, listening, thinking, liveCaption, messages } = call;
  const latest = messages[messages.length - 1];
  const caption = liveCaption
    ? { speaker: "You", text: liveCaption }
    : latest
      ? { speaker: latest.role === "user" ? "You" : "Interviewer", text: latest.content }
      : null;

  const statusText = scoring
    ? "Scoring your answers"
    : status === "CONNECTING"
      ? "Connecting"
      : status !== "ACTIVE"
        ? null
        : aiSpeaking
          ? "Interviewer is speaking"
          : thinking
            ? "Thinking"
            : listening
              ? "Listening. Answer out loud, then pause"
              : null;

  return (
    <>
      <div className="call-view">
        <div className={cn("card-interviewer transition-colors", aiSpeaking && "border-primary-200")}>
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="" width={65} height={54} className="object-cover" />
            {aiSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className={cn("card-content transition-shadow", listening && "ring-2 ring-success-100/60")}>
            <Image
              src={userImage || "/user-avatar.png"}
              alt=""
              width={540}
              height={540}
              unoptimized={Boolean(userImage)}
              className="size-[120px] rounded-full object-cover"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {caption && (
        <div className="transcript-border">
          <div className="transcript flex-col !items-start gap-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-200">
              {caption.speaker}
            </span>
            <p key={caption.text} className="animate-fadeIn text-left">
              {caption.text}
            </p>
          </div>
        </div>
      )}

      <p className="min-h-6 text-center text-sm text-light-400" aria-live="polite">
        {statusText}
      </p>

      <div className="flex w-full items-center justify-center gap-3">
        {scoreFailed && onRetryScoring ? (
          <button type="button" className="btn-call" onClick={onRetryScoring}>
            Try scoring again
          </button>
        ) : status === "ACTIVE" ? (
          <>
            {call.finishAnswer && listening && (
              <button
                type="button"
                onClick={call.finishAnswer}
                className="rounded-full border border-primary-200/30 px-6 py-3 text-sm font-bold text-primary-100 transition-colors hover:border-primary-200/60"
              >
                I&apos;m done answering
              </button>
            )}
            <button type="button" className="btn-disconnect" onClick={call.end}>
              End
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-call relative"
            onClick={call.start}
            disabled={status === "CONNECTING" || scoring || status === "FINISHED"}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                status !== "CONNECTING" && "hidden"
              )}
            />
            <span>{status === "CONNECTING" ? ". . ." : scoring || status === "FINISHED" ? "Done" : "Call"}</span>
          </button>
        )}
      </div>
    </>
  );
}
