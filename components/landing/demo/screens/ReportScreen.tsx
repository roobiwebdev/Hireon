import { demoInterview, feedbackCategories, heroFilm } from "@/constants/landing";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, RotateCcw, Target } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { easeInOut, easeOut, popIn, span } from "../ease";
import { MAIN, REPORT, T } from "../script";

const RING = { size: 188, stroke: 14 } as const;
const RADIUS = (RING.size - RING.stroke) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The film's feedback page, mirroring app/(root)/interview/[id]/feedback/page.tsx in a dashboard layout. */
export default function ReportScreen({ t }: { t: number }) {
  const scoreP = easeInOut(span(t, T.score[0], T.score[1]));
  const score = Math.round(demoInterview.totalScore * scoreP);
  const landed = easeOut(span(t, T.score[1], T.score[1] + 700));
  const hovering = t >= T.retakeHover && t < 28_700;
  const rightW = MAIN.w - REPORT.rightX;
  const cardW = (rightW - 12) / 2;

  return (
    <div className="absolute inset-0">
      {/* Score card */}
      <div className="absolute overflow-hidden rounded-3xl blue-gradient-dark ring-1 ring-primary-200/20" style={{ left: 0, top: 0, width: REPORT.leftW, height: MAIN.h }}>
        <div aria-hidden className="absolute left-1/2 top-24 size-56 -translate-x-1/2 rounded-full bg-primary-200/20 blur-3xl" style={{ opacity: 0.4 + 0.6 * landed }} />
        <p className="absolute inset-x-6 top-6 text-[13px] font-semibold uppercase tracking-[0.18em] text-primary-200">Feedback</p>
        <p className="absolute inset-x-6 top-[50px] text-[24px] font-semibold leading-tight text-white">{demoInterview.role} Interview</p>

        <div className="absolute left-1/2 top-[110px]" style={{ width: RING.size, height: RING.size, transform: `translateX(-50%) scale(${1 + 0.04 * Math.sin(landed * Math.PI)})` }}>
          <svg width={RING.size} height={RING.size} className="-rotate-90">
            <circle cx={RING.size / 2} cy={RING.size / 2} r={RADIUS} className="fill-none stroke-white/[0.07]" strokeWidth={RING.stroke} />
            <circle
              cx={RING.size / 2}
              cy={RING.size / 2}
              r={RADIUS}
              className="fill-none stroke-primary-200"
              strokeWidth={RING.stroke}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - (demoInterview.totalScore / 100) * scoreP)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[56px] font-bold leading-none tabular-nums text-white">{score}</span>
            <span className="mt-1 text-[15px] text-light-400">out of 100</span>
          </div>
        </div>

        <div className="absolute inset-x-6 top-[322px] flex items-center justify-center gap-2 text-[15px] text-light-100">
          <Image src="/calendar.svg" alt="" width={18} height={18} />
          {heroFilm.date}
        </div>

        <div className="absolute flex items-center justify-center gap-2 rounded-full bg-dark-200 text-[15px] font-bold text-primary-200" style={{ left: REPORT.retake.x, top: REPORT.retake.y - 60, width: REPORT.retake.w, height: REPORT.retake.h }}>
          Back to dashboard
        </div>
        <div
          className={cn(
            "absolute flex items-center justify-center gap-2 rounded-full bg-primary-200 text-[15px] font-bold text-dark-100",
            hovering && "shadow-[0_10px_36px_-8px] shadow-primary-200/70"
          )}
          style={{
            left: REPORT.retake.x,
            top: REPORT.retake.y,
            width: REPORT.retake.w,
            height: REPORT.retake.h,
            transform: `scale(${hovering ? 1.03 : 1})`,
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Retake Interview
          <ArrowRight className="size-4" style={{ transform: `translateX(${hovering ? 3 : 0}px)` }} aria-hidden />
        </div>
      </div>

      {/* Breakdown */}
      <div className="absolute rounded-3xl border-gradient p-px" style={{ left: REPORT.rightX, top: 0, width: rightW, height: REPORT.breakdownH }}>
        <div className="flex h-full flex-col gap-3.5 rounded-3xl dark-gradient px-6 py-5">
          <p className="text-[18px] font-semibold text-white">Breakdown of the Interview</p>
          {feedbackCategories.map((name, i) => {
            const target = demoInterview.scores[i] ?? 0;
            const p = easeOut(span(t, T.bars + i * 260, T.bars + i * 260 + 700));
            return (
              <div key={name} className="flex items-center gap-4">
                <span className="w-[200px] shrink-0 text-[15px] text-light-100">{name}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full origin-left rounded-full bg-gradient-to-r from-primary-200/60 to-primary-200"
                    style={{ transform: `scaleX(${(target / 100) * p})` }}
                  />
                </span>
                <span className="w-9 text-right text-[15px] font-semibold tabular-nums text-white">{Math.round(target * p)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ListCard
        style={{ left: REPORT.rightX, top: REPORT.cardsY, width: cardW, height: MAIN.h - REPORT.cardsY, ...popIn(t, T.strengths) }}
        title="Strengths"
        items={heroFilm.strengths}
        tone="success"
        t={t}
        at={T.strengths}
      />
      <ListCard
        style={{ left: REPORT.rightX + cardW + 12, top: REPORT.cardsY, width: cardW, height: MAIN.h - REPORT.cardsY, ...popIn(t, T.improvements) }}
        title="Areas for Improvement"
        items={heroFilm.improvements}
        tone="primary"
        t={t}
        at={T.improvements}
      />
    </div>
  );
}

function ListCard({
  style,
  title,
  items,
  tone,
  t,
  at,
}: {
  style: CSSProperties;
  title: string;
  items: ReadonlyArray<string>;
  tone: "success" | "primary";
  t: number;
  at: number;
}) {
  const Icon = tone === "success" ? Check : Target;
  return (
    <div
      className={cn(
        "absolute flex flex-col gap-4 rounded-3xl bg-dark-300/60 p-6 ring-1 backdrop-blur-md",
        tone === "success" ? "ring-success-100/25" : "ring-primary-200/25"
      )}
      style={style}
    >
      <p className="text-[18px] font-semibold text-white">{title}</p>
      {items.map((item, i) => (
        <div key={item} className="flex items-start gap-3" style={popIn(t, at + 250 + i * 160, 420, 10)}>
          <span
            className={cn(
              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
              tone === "success" ? "bg-success-100/15 text-success-100" : "bg-primary-200/15 text-primary-200"
            )}
          >
            <Icon className="size-3.5" strokeWidth={3} aria-hidden />
          </span>
          <span className="text-[15px] leading-snug text-light-100">{item}</span>
        </div>
      ))}
    </div>
  );
}
