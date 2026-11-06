import { heroFilm } from "@/constants/landing";
import { cn, getTechLogoUrl } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import Image from "next/image";
import { clamp, easeOut, popIn, span } from "../ease";
import { LEVEL_INDEX, MAIN, ROLE_TEXT, SETUP, STACK, STACK_TEXT, T, typed } from "../script";

const LABEL = "absolute text-[15px] text-light-100";

/** The film's setup form, mirroring components/InterviewSetupForm.tsx, filled in by the cursor. */
export default function SetupScreen({ t }: { t: number }) {
  // After the loop wraps back to this screen it shows the empty form again.
  const fresh = t >= T.backIn[0];
  const role = fresh ? "" : typed(ROLE_TEXT, t, T.roleType);
  const stack = fresh ? "" : typed(STACK_TEXT, t, T.stackType);
  const level = !fresh && t >= T.levelClick ? LEVEL_INDEX : 0;
  const roleFocused = !fresh && t >= T.roleClick && t < T.levelClick;
  const stackFocused = !fresh && t >= T.stackClick && t < T.create;
  const caretOn = Math.floor(t / 480) % 2 === 0;
  const writing = !fresh && t >= T.writing[0];
  const ready = !fresh && t >= T.ready;
  const shown = STACK.filter((tech) => stack.includes(tech));

  return (
    <div className="absolute inset-0">
      {/* Live preview of the interview being set up */}
      <div
        className="absolute overflow-hidden rounded-3xl blue-gradient-dark ring-1 ring-primary-200/20"
        style={{ left: 0, top: 0, width: SETUP.panelW, height: MAIN.h }}
      >
        <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-primary-200/15 blur-3xl" />
        <div className="absolute inset-x-7 top-7 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-primary-200">
          <Sparkles className="size-4" aria-hidden />
          Interview preview
        </div>

        <div className="absolute left-7 top-[78px] flex size-[92px] items-center justify-center rounded-full blue-gradient shadow-[0_0_60px] shadow-primary-200/35">
          <Image src="/ai-avatar.png" alt="" width={56} height={46} />
        </div>

        <div className="absolute inset-x-7 top-[196px]">
          <p className={cn("text-[28px] font-semibold leading-tight", role ? "text-white" : "text-light-600")}>
            {role || "Your next interview"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              key={level}
              style={level > 0 ? popIn(t, T.levelClick, 420, 10) : undefined}
              className="rounded-full bg-primary-200/15 px-3 py-1 text-[14px] font-semibold text-primary-100"
            >
              {SETUP.levels[level]?.label}
            </span>
            <span className="rounded-full bg-dark-200 px-3 py-1 text-[14px] font-semibold text-light-100">
              {SETUP.types[0]?.label}
            </span>
          </div>
          <div className="mt-5 flex gap-2.5">
            {shown.map((tech, i) => (
              <span
                key={tech}
                style={popIn(t, T.stackType[0] + ((i + 1) / STACK.length) * (T.stackType[1] - T.stackType[0]), 420, 12)}
                className="flex size-11 items-center justify-center rounded-full bg-dark-200 ring-1 ring-white/10"
              >
                <Image src={getTechLogoUrl(tech)} alt="" width={24} height={24} unoptimized />
              </span>
            ))}
          </div>
        </div>

        {/* Writing → ready */}
        <div className="absolute inset-x-7 bottom-7">
          {ready ? (
            <div style={popIn(t, T.ready, 520, 16)} className="flex items-center gap-3 rounded-2xl bg-success-100/10 px-4 py-3 ring-1 ring-success-100/30">
              <span className="flex size-8 items-center justify-center rounded-full bg-success-100 text-dark-100">
                <Check className="size-5" strokeWidth={3} aria-hidden />
              </span>
              <span className="text-[16px] font-semibold text-white">{heroFilm.questionCount} questions ready</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5" style={{ opacity: writing ? 1 : 0.35 }}>
              {[0.9, 0.7, 0.8].map((w, i) => (
                <div key={w} className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]" style={{ width: `${w * 100}%` }}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-200/0 via-primary-200/70 to-primary-200/0"
                    style={{ transform: `translateX(${writing ? ((((t - T.writing[0]) / 900 + i * 0.3) % 1.4) - 0.7) * 100 : -100}%)` }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The form */}
      <div className="absolute top-0" style={{ left: SETUP.formX, width: SETUP.formW }}>
        <h3 className="text-[30px] font-semibold leading-none text-primary-100">Set up your interview</h3>
        <p className="mt-3 text-[16px] text-light-400">Tell us the job you are practicing for. We&apos;ll write the questions.</p>
      </div>

      <Field label="Job title" y={SETUP.role.y} h={SETUP.role.h} value={role} placeholder="e.g. Frontend Developer" focused={roleFocused} caret={roleFocused && caretOn} />

      <span className={LABEL} style={{ left: SETUP.formX, top: SETUP.chipsY - 24 }}>Level</span>
      <Chips x={SETUP.formX} y={SETUP.chipsY} chips={SETUP.levels} selected={level} t={t} at={fresh ? -1 : T.levelClick} />
      <span className={LABEL} style={{ left: SETUP.focusX, top: SETUP.chipsY - 24 }}>Focus</span>
      <Chips x={SETUP.focusX} y={SETUP.chipsY} chips={SETUP.types} selected={0} t={t} at={-1} />

      <Field label="Tech stack (comma separated)" y={SETUP.stack.y} h={SETUP.stack.h} value={stack} placeholder="e.g. React, TypeScript, Next.js" focused={stackFocused} caret={stackFocused && caretOn} />

      <span className={LABEL} style={{ left: SETUP.formX, top: SETUP.countY - 24 }}>Number of questions</span>
      <Chips
        x={SETUP.formX}
        y={SETUP.countY}
        chips={SETUP.counts.map((n) => ({ label: String(n), w: SETUP.countW }))}
        selected={SETUP.counts.indexOf(heroFilm.questionCount)}
        t={t}
        at={-1}
      />

      <div
        className={cn(
          "absolute flex items-center justify-center gap-3 rounded-full bg-primary-200 text-[17px] font-bold text-dark-100 shadow-[0_12px_40px_-12px] shadow-primary-200/80",
          writing && !ready && "bg-primary-200/80"
        )}
        style={{
          left: SETUP.formX,
          top: SETUP.button.y,
          width: SETUP.formW,
          height: SETUP.button.h,
          transform: `scale(${1 - 0.03 * clamp(1 - Math.abs(t - T.create) / 160)})`,
        }}
      >
        {writing && !ready && (
          <span className="size-4 rounded-full border-2 border-dark-100/30 border-t-dark-100" style={{ transform: `rotate(${t * 0.5}deg)` }} />
        )}
        {writing ? (ready ? "Opening your interview" : "Writing your questions") : "Create interview"}
      </div>
    </div>
  );
}

function Field({
  label,
  y,
  h,
  value,
  placeholder,
  focused,
  caret,
}: {
  label: string;
  y: number;
  h: number;
  value: string;
  placeholder: string;
  focused: boolean;
  caret: boolean;
}) {
  return (
    <>
      <span className={LABEL} style={{ left: SETUP.formX, top: y - 24 }}>{label}</span>
      <div
        className={cn(
          "absolute flex items-center rounded-full bg-dark-200 px-5 text-[17px] ring-1 transition-none",
          focused ? "ring-2 ring-primary-200/70 shadow-[0_0_0_6px] shadow-primary-200/10" : "ring-white/[0.06]"
        )}
        style={{ left: SETUP.formX, top: y, width: SETUP.formW, height: h }}
      >
        {value ? <span className="text-white">{value}</span> : <span className="text-light-400">{placeholder}</span>}
        {caret && <span className="ml-0.5 h-5 w-[2px] bg-primary-200" />}
      </div>
    </>
  );
}

function Chips({
  x,
  y,
  chips,
  selected,
  t,
  at,
}: {
  x: number;
  y: number;
  chips: ReadonlyArray<{ label: string; w: number }>;
  selected: number;
  t: number;
  at: number;
}) {
  let left = x;
  return chips.map((chip, i) => {
    const chipLeft = left;
    left += chip.w + 8;
    const on = i === selected;
    // The newly picked chip flashes in; the others just sit there.
    const flash = on && at >= 0 && t >= at ? easeOut(span(t, at, at + 300)) : 1;
    return (
      <div
        key={chip.label}
        className={cn(
          "absolute flex items-center justify-center rounded-full text-[15px] font-semibold ring-1",
          on ? "bg-primary-200 text-dark-100 ring-primary-200" : "bg-dark-200 text-light-100 ring-white/[0.06]"
        )}
        style={{
          left: chipLeft,
          top: y,
          width: chip.w,
          height: SETUP.chipH,
          opacity: on ? 0.55 + 0.45 * flash : 1,
          transform: `scale(${on ? 0.94 + 0.06 * flash : 1})`,
        }}
      >
        {chip.label}
      </div>
    );
  });
}
