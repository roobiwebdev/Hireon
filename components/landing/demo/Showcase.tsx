"use client";

import { heroFilm } from "@/constants/landing";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { span } from "./ease";
import Scene from "./Scene";
import { CHAPTERS, DURATION, STAGE, activeCaption } from "./script";
import { usePlayer } from "./usePlayer";

const chapters = CHAPTERS.map((c, i) => ({ ...c, end: CHAPTERS[i + 1]?.t ?? DURATION }));

/**
 * SOURCE OF TRUTH KEYWORDS: Showcase, hero film, product film, chapter bar, play with sound, stage scale
 * WHAT:  The hero film: the fixed-size Scene scaled to fit its frame, plus play, replay, sound and chapter controls.
 * WHY:   A code-drawn "screen recording" of a real Hireon session that stays crisp at any width and ships no video.
 * WHERE: components/landing/HeroFilm.tsx (loaded after the hero text).
 */
export default function Showcase() {
  const player = usePlayer();
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setScale((entry?.contentRect.width ?? STAGE.w) / STAGE.w));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Phones get the caption under the frame at a readable size instead of inside the scaled stage.
  const compact = scale > 0 && scale < 0.5;
  const caption = activeCaption(player.time);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={(node) => {
          frameRef.current = node;
          player.observe(node);
        }}
        role="img"
        aria-label={heroFilm.ariaLabel}
        className="relative w-full overflow-hidden rounded-2xl bg-dark-100 shadow-[0_40px_120px_-20px] shadow-primary-200/20 ring-1 ring-white/10"
        style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }}
      >
        {scale > 0 && (
          <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
            <Scene t={player.time} showCaption={!compact} />
          </div>
        )}
        {!player.sound && (
          <button
            type="button"
            onClick={player.playWithSound}
            aria-label="Play with sound"
            className="absolute right-2 top-2 flex size-8 items-center justify-center gap-2 rounded-full bg-dark-100/45 text-sm font-semibold text-white ring-1 ring-inset ring-white/15 backdrop-blur-[14px] backdrop-saturate-[1.9] transition-colors hover:bg-dark-100/65 sm:bottom-5 sm:right-5 sm:top-auto sm:h-11 sm:w-auto sm:px-5"
          >
            <Play className="size-3.5 fill-current" aria-hidden />
            <span className="max-sm:hidden">Play with sound</span>
          </button>
        )}
      </div>

      {compact && (
        <p className="min-h-12 text-balance px-2 text-center text-base font-semibold text-white" aria-hidden>
          {caption?.caption.words.map((word, i) => (
            <span key={`${i}-${word.text}`} className="transition-opacity" style={{ opacity: player.time >= word.at ? 1 : 0.32 }}>
              {word.text}{" "}
            </span>
          ))}
        </p>
      )}

      <div className="flex w-full items-start gap-2 sm:gap-3">
        <button type="button" onClick={player.toggle} aria-label={player.paused ? "Play" : "Pause"} className={CONTROL}>
          {player.paused ? <Play className="size-4 fill-current" aria-hidden /> : <Pause className="size-4 fill-current" aria-hidden />}
        </button>
        <button type="button" onClick={player.replay} aria-label="Replay" className={CONTROL}>
          <RotateCcw className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={player.toggleSound}
          aria-pressed={player.sound}
          aria-label={player.sound ? "Mute sound" : "Turn on sound"}
          className={cn(CONTROL, "w-auto gap-2 px-3.5 text-xs font-semibold", player.sound && "bg-primary-200/15 text-primary-100 ring-primary-200/30")}
        >
          {player.sound ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
          <span className="max-sm:hidden">Sound</span>
        </button>

        <ol className="flex min-w-0 flex-1 list-none gap-1.5 pt-1">
          {chapters.map((c, i) => {
            const p = span(player.time, c.t, c.end);
            const current = p > 0 && p < 1;
            return (
              <li key={c.label} className="min-w-0" style={{ flexGrow: c.end - c.t, flexBasis: 0 }}>
                <button
                  type="button"
                  onClick={() => player.seek(c.t)}
                  aria-label={`Chapter ${i + 1}: ${c.label}`}
                  aria-current={current ? "step" : undefined}
                  className="group flex w-full flex-col gap-2 text-left"
                >
                  <span className="h-1 w-full overflow-hidden rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                    <span className="block h-full origin-left rounded-full bg-primary-200" style={{ transform: `scaleX(${p})` }} />
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 truncate text-xs transition-colors max-md:hidden",
                      current ? "text-white" : "text-light-400 group-hover:text-light-100"
                    )}
                  >
                    <span className={cn("tabular-nums", current ? "text-primary-200" : "text-light-600")}>{i + 1}</span>
                    {c.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

const CONTROL =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-dark-200/70 text-light-100 ring-1 ring-white/10 transition-colors hover:bg-dark-200 hover:text-white";
