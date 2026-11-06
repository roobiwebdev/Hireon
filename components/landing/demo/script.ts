import { demoInterview, heroFilm } from "@/constants/landing";
import { along, envelope, span, type Keyframe } from "./ease";
import type { Sound } from "./sound";

/**
 * SOURCE OF TRUTH KEYWORDS: hero film script, timeline, STAGE, CHAPTERS, CAPTIONS, CUES, cursor path, layout targets
 * WHAT:  Every timestamp, layout rectangle and cursor keyframe of the hero film, in milliseconds and stage pixels.
 * WHY:   The scene is a pure function of `t`; this file is the only place timing lives, so seeking,
 *        looping, sound and reduced motion all agree. Cursor targets are derived from the same layout
 *        the screens draw, so the cursor always lands on the control it clicks.
 * WHERE: components/landing/demo/* (Scene, screens, usePlayer, Showcase).
 */

/** The scene is laid out at this size and scaled to fit. */
export const STAGE = { w: 1200, h: 760 } as const;

/** The browser window, its title bar, the app's nav bar, and the page area every screen draws into. */
export const WINDOW = { x: 60, y: 26, w: 1080, h: 644 } as const;
export const TITLE_H = 44;
export const NAV_H = 54;
export const MAIN = {
  x: WINDOW.x + 28,
  y: WINDOW.y + TITLE_H + NAV_H + 20,
  w: WINDOW.w - 56,
  h: WINDOW.h - TITLE_H - NAV_H - 40,
} as const;

export const DURATION = 30_000;
/** With reduced motion the film holds here: the finished report with score, bars and both cards. */
export const SETTLED = 26_200;

/** Setup screen layout, relative to MAIN. */
export const SETUP = {
  panelW: 360,
  formX: 392,
  formW: 632,
  role: { y: 106, h: 48 },
  chipsY: 196,
  chipH: 40,
  levels: [
    { label: "Junior", w: 88 },
    { label: "Mid-level", w: 106 },
    { label: "Senior", w: 88 },
  ],
  focusX: 708,
  types: [
    { label: "Technical", w: 100 },
    { label: "Behavioural", w: 116 },
    { label: "Mixed", w: 76 },
  ],
  stack: { y: 280, h: 48 },
  countY: 370,
  counts: [3, 5, 8, 10],
  countW: 56,
  button: { y: 444, h: 54 },
} as const;

/** Call screen layout, relative to MAIN. */
export const CALL = {
  cardsY: 62,
  cardsH: 264,
  cardGap: 12,
  captionY: 342,
  captionH: 80,
  statusY: 432,
  buttonsY: 458,
  buttonH: 48,
  callW: 150,
  doneW: 210,
  endW: 120,
} as const;

/** Feedback screen layout, relative to MAIN. */
export const REPORT = {
  leftW: 336,
  rightX: 356,
  breakdownH: 262,
  cardsY: 278,
  retake: { x: 24, y: 432, w: 288, h: 50 },
} as const;

const onMain = (x: number, y: number) => ({ x: MAIN.x + x, y: MAIN.y + y });
const chipX = (chips: ReadonlyArray<{ w: number }>, index: number) =>
  chips.slice(0, index).reduce((sum, chip) => sum + chip.w + 8, 0);

const FORM_CX = SETUP.formX + SETUP.formW / 2;
const ROLE_INPUT = onMain(SETUP.formX + 180, SETUP.role.y + SETUP.role.h / 2);
const MID_CHIP = onMain(
  SETUP.formX + chipX(SETUP.levels, 1) + (SETUP.levels[1]?.w ?? 0) / 2,
  SETUP.chipsY + SETUP.chipH / 2
);
const STACK_INPUT = onMain(SETUP.formX + 220, SETUP.stack.y + SETUP.stack.h / 2);
const CREATE = onMain(FORM_CX, SETUP.button.y + SETUP.button.h / 2);
const CALL_BUTTON = onMain(MAIN.w / 2, CALL.buttonsY + CALL.buttonH / 2);
/** While the call is live the controls are "I'm done answering" and "End", centred together. */
export const LIVE_BUTTONS_X = MAIN.w / 2 - (CALL.doneW + 12 + CALL.endW) / 2;
const END_BUTTON = onMain(LIVE_BUTTONS_X + CALL.doneW + 12 + CALL.endW / 2, CALL.buttonsY + CALL.buttonH / 2);
const RETAKE = onMain(REPORT.retake.x + REPORT.retake.w / 2, REPORT.retake.y + REPORT.retake.h / 2);

export const ROLE_TEXT = demoInterview.role;
export const STACK_TEXT = heroFilm.techstack;
export const STACK = demoInterview.techstack;
export const LEVEL_INDEX = 1;

export const T = {
  roleClick: 1050,
  roleType: [1200, 2400],
  levelClick: 3100,
  stackClick: 3800,
  stackType: [3950, 4850],
  create: 5350,
  writing: [5350, 6450],
  ready: 6000,
  toCall: [6500, 6950],
  call: 7500,
  connecting: [7500, 8200],
  ask: [8200, 10_300],
  listen: [10_500, 13_800],
  answer: [10_750, 13_450],
  think: [13_800, 14_350],
  followUp: [14_400, 16_300],
  listen2: [16_400, 18_600],
  answer2: [16_600, 18_350],
  end: 18_950,
  scoring: [18_950, 20_250],
  toReport: [20_050, 20_550],
  score: [20_700, 22_300],
  bars: 21_000,
  strengths: 24_600,
  improvements: 25_050,
  retakeHover: 26_400,
  out: [28_900, 29_700],
  backIn: [29_100, 29_950],
} as const;

export const CLICKS = [T.roleClick, T.levelClick, T.stackClick, T.create, T.call, T.end] as const;

const CURSOR: Keyframe[] = [
  { t: 0, x: 720, y: 560 },
  { t: 350, x: 720, y: 560 },
  { t: 950, ...ROLE_INPUT },
  { t: 2500, ...ROLE_INPUT },
  { t: 3000, ...MID_CHIP },
  { t: 3250, ...MID_CHIP },
  { t: 3700, ...STACK_INPUT },
  { t: 4950, ...STACK_INPUT },
  { t: 5250, ...CREATE },
  { t: 6650, ...CREATE },
  { t: 7300, ...CALL_BUTTON },
  { t: 7750, ...CALL_BUTTON },
  { t: 8400, x: 760, y: 560 },
  { t: 17_800, x: 790, y: 566 },
  { t: 18_750, ...END_BUTTON },
  { t: 19_400, ...END_BUTTON },
  { t: 20_300, x: 860, y: 600 },
  { t: 25_800, x: 820, y: 610 },
  { t: T.retakeHover, ...RETAKE },
  { t: 28_700, x: RETAKE.x + 6, y: RETAKE.y + 2 },
  { t: 29_800, x: 720, y: 560 },
  { t: DURATION, x: 720, y: 560 },
];

export const cursorAt = (t: number) => along(CURSOR, t);

export type CursorKind = "arrow" | "text" | "pointer";

/** The I-beam while hovering a text field, the hand over buttons, the arrow everywhere else. */
export function cursorKind(t: number): CursorKind {
  if ((t >= 950 && t < 2550) || (t >= 3700 && t < 5000)) return "text";
  if ((t >= 2950 && t < 3300) || (t >= 5200 && t < 5450) || (t >= 7250 && t < 7600)) return "pointer";
  if ((t >= 18_700 && t < 19_050) || (t >= T.retakeHover - 100 && t < 28_700)) return "pointer";
  return "arrow";
}

/** How pressed the cursor is: 1 at a click, easing back to 0 over a short window. */
export function pressAt(t: number) {
  let press = 0;
  for (const click of CLICKS) {
    const d = t - click;
    if (d > -90 && d < 160) press = Math.max(press, 1 - Math.abs(d < 0 ? d / 90 : d / 160));
  }
  return press;
}

/** The part of `text` typed by `t`, one character at a time across [start, end]. */
export const typed = (text: string, t: number, [start, end]: readonly [number, number]) =>
  text.slice(0, Math.round(span(t, start, end) * text.length));

export type Screen = "setup" | "call" | "report";

/** The page the browser window is on; the URL bar and the cross-fades follow it. */
export function screenAt(t: number): Screen {
  if (t < T.toCall[0] || t >= T.backIn[0]) return "setup";
  if (t < T.toReport[0]) return "call";
  return "report";
}

export type CallPhase = "ready" | "connecting" | "speaking" | "listening" | "thinking" | "scoring";

export function callPhase(t: number): CallPhase {
  if (t < T.connecting[0]) return "ready";
  if (t < T.connecting[1]) return "connecting";
  if (t >= T.scoring[0]) return "scoring";
  if ((t >= T.ask[0] && t < T.ask[1]) || (t >= T.followUp[0] && t < T.followUp[1])) return "speaking";
  if ((t >= T.listen[0] && t < T.listen[1]) || (t >= T.listen2[0] && t < T.listen2[1])) return "listening";
  return "thinking";
}

const [question, answer, followUp, answer2] = demoInterview.conversation.map((line) => line.text);

/** What the call's caption box shows at `t`: the interviewer's line, or the candidate's words as they're heard. */
export function callCaption(t: number): { speaker: "Interviewer" | "You"; text: string; at: number } | null {
  if (t >= T.answer2[0]) return { speaker: "You", text: heard(answer2 ?? "", t, T.answer2), at: T.answer2[0] };
  if (t >= T.followUp[0]) return { speaker: "Interviewer", text: followUp ?? "", at: T.followUp[0] };
  if (t >= T.answer[0]) return { speaker: "You", text: heard(answer ?? "", t, T.answer), at: T.answer[0] };
  if (t >= T.ask[0]) return { speaker: "Interviewer", text: question ?? "", at: T.ask[0] };
  return null;
}

/** Speech recognition delivers whole words, so the live caption grows word by word. */
function heard(text: string, t: number, window: readonly [number, number]) {
  const words = text.split(" ");
  return words.slice(0, Math.ceil(span(t, window[0], window[1]) * words.length)).join(" ");
}

/** The words of an interviewer line light up as they're spoken across `window`. */
export const spokenProgress = (t: number) => {
  if (t >= T.followUp[0] && t < T.answer2[0]) return span(t, T.followUp[0], T.followUp[1]);
  if (t >= T.ask[0] && t < T.answer[0]) return span(t, T.ask[0], T.ask[1]);
  return 1;
};

export const CHAPTERS = [
  { label: heroFilm.chapters[0], t: 0 },
  { label: heroFilm.chapters[1], t: 6400 },
  { label: heroFilm.chapters[2], t: 10_400 },
  { label: heroFilm.chapters[3], t: 14_350 },
  { label: heroFilm.chapters[4], t: 20_000 },
  { label: heroFilm.chapters[5], t: 24_400 },
] as const;

export type Caption = { start: number; end: number; words: { text: string; at: number }[] };

/** Spreads the words across [start, end], giving longer words more time. */
function caption(text: string, start: number, end: number): Caption {
  const parts = text.split(" ");
  const weights = parts.map((word) => word.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let at = start;
  const words = parts.map((word, i) => {
    const entry = { text: word, at };
    at += ((end - start) * (weights[i] ?? 0)) / total;
    return entry;
  });
  return { start, end, words };
}

const [c1, c2, c3, c4, c5, c6] = heroFilm.captions;
export const CAPTIONS: Caption[] = [
  caption(c1, 300, 2600),
  caption(c2, 7900, 9700),
  caption(c3, 10_700, 12_600),
  caption(c4, 14_600, 16_600),
  caption(c5, 20_700, 22_500),
  caption(c6, 24_700, 26_700),
];
/** Each caption stays up this long after its last word lights. */
export const CAPTION_HOLD = 1600;

/** The film caption on screen at `t`, with its fade, or null between captions. */
export function activeCaption(t: number) {
  for (const c of CAPTIONS) {
    const end = c.end + CAPTION_HOLD;
    if (t >= c.start - 300 && t < end) return { caption: c, opacity: envelope(t, c.start - 300, c.start, end - 400, end) };
  }
  return null;
}

export type Cue = { t: number; sound: Sound; variant?: number };
const cue = (t: number, sound: Sound, variant?: number): Cue => ({ t, sound, variant });

/** A key click for every other typed character, so fast typing doesn't turn into a buzz. */
const keys = (text: string, [start, end]: readonly [number, number]) =>
  Array.from({ length: Math.ceil(text.length / 2) }, (_, i) =>
    cue(start + ((end - start) * (i * 2 + 1)) / text.length, "key", i)
  );

export const CUES: Cue[] = [
  ...CLICKS.map((t) => cue(t, "switch")),
  ...keys(ROLE_TEXT, T.roleType),
  cue(T.levelClick + 40, "pop"),
  ...keys(STACK_TEXT, T.stackType),
  ...STACK.map((_, i) => cue(T.stackType[0] + ((i + 1) / STACK.length) * (T.stackType[1] - T.stackType[0]), "tick")),
  cue(T.create + 60, "sweep"),
  cue(T.ready, "chime"),
  cue(T.toCall[0], "whoosh"),
  cue(T.connecting[1], "start"),
  cue(T.ask[0], "blip"),
  cue(T.listen[0], "tick"),
  cue(T.followUp[0], "blip"),
  cue(T.listen2[0], "tick"),
  cue(T.end + 30, "stop"),
  cue(T.toReport[0] + 100, "whoosh"),
  cue(T.score[0], "sweep"),
  ...demoInterview.scores.map((_, i) => cue(T.bars + i * 260 + 640, "tick", i)),
  cue(T.score[1], "chime"),
  cue(T.strengths, "pop"),
  cue(T.improvements, "pop", 2),
  cue(T.out[0] + 200, "whoosh"),
].sort((a, b) => a.t - b.t);
