"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion, whileVisible } from "./frame";
import { CUES, DURATION, SETTLED } from "./script";
import { play, unlock } from "./sound";

/**
 * SOURCE OF TRUTH KEYWORDS: usePlayer, film clock, play pause seek, loop, play with sound, reduced motion, hero film
 * WHAT:  The hero film's clock: `t` in ms, advanced by the shared rAF loop while the film is on screen.
 * WHY:   One clock drives the whole scene. It loops silently by default, plays once with sound on request,
 *        fires sound cues that fall between frames, and holds SETTLED for reduced motion until pressed.
 * WHERE: components/landing/demo/Showcase.tsx.
 */
export function usePlayer() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sound, setSound] = useState(false);
  const [touched, setTouched] = useState(false);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const tRef = useRef(0);
  const soundRef = useRef(false);

  // Reduced motion only holds the film still until the visitor starts it themselves.
  const moving = !reduced || touched;
  const paused = !playing || !moving;

  useEffect(() => {
    if (!node || paused) return;
    return whileVisible(node, (dt) => {
      const from = tRef.current;
      const to = from + dt;
      if (soundRef.current) {
        for (const cue of CUES) if (cue.t > from && cue.t <= to) play(cue.sound, cue.variant);
      }
      let next = to % DURATION;
      // With sound on the film plays once, then stops on its last frame.
      if (to >= DURATION && soundRef.current) {
        next = DURATION;
        setPlaying(false);
      }
      tRef.current = next;
      setT(next);
    });
  }, [node, paused]);

  const jump = useCallback((to: number) => {
    tRef.current = to;
    setT(to);
    setTouched(true);
  }, []);

  const setSoundOn = (on: boolean) => {
    if (on) unlock();
    soundRef.current = on;
    setSound(on);
  };

  return {
    /** The time the scene should draw. */
    time: moving ? t : SETTLED,
    paused,
    sound,
    /** Attach to the film's frame; the clock only runs while it is on screen. */
    observe: setNode,
    toggle() {
      if (paused) {
        jump(tRef.current >= DURATION ? 0 : tRef.current);
        setPlaying(true);
      } else {
        setPlaying(false);
      }
    },
    replay() {
      jump(0);
      setPlaying(true);
    },
    seek(to: number) {
      jump(to);
    },
    playWithSound() {
      setSoundOn(true);
      jump(0);
      setPlaying(true);
    },
    toggleSound() {
      setSoundOn(!soundRef.current);
    },
  };
}
