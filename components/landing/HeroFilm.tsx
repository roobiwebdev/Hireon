"use client";

import dynamic from "next/dynamic";
import { STAGE } from "./demo/script";

/** Holds the film's space while its code loads, so nothing below the hero jumps. */
function Placeholder() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div
        className="w-full animate-pulse rounded-2xl bg-dark-200/40 ring-1 ring-white/10"
        style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }}
      />
      <div className="h-9" />
    </div>
  );
}

/**
 * SOURCE OF TRUTH KEYWORDS: HeroFilm, lazy hero demo, dynamic import, product film loader, landing hero
 * WHAT:  Loads the hero film (demo/Showcase) on the client after the page paints.
 * WHY:   The headline and CTA render instantly; the film's code arrives separately.
 * WHERE: components/landing/Hero.tsx.
 */
const HeroFilm = dynamic(() => import("./demo/Showcase"), { ssr: false, loading: Placeholder });

export default HeroFilm;
