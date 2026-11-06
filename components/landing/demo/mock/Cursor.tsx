import type { CursorKind } from "../script";

/**
 * SOURCE OF TRUTH KEYWORDS: Cursor, mock cursor, arrow, I-beam, pointer hand, pressed cursor, hero film
 * WHAT:  A drawn mouse cursor at stage coordinates: arrow, text I-beam or pointing hand, shrinking while pressed.
 * WHY:   The film's one focal point; it shows what the visitor would click and type.
 * WHERE: components/landing/demo/Scene.tsx.
 */
export default function Cursor({ x, y, kind, press }: { x: number; y: number; kind: CursorKind; press: number }) {
  const scale = 1 - press * 0.14;
  return (
    <div
      aria-hidden
      className="absolute left-0 top-0 z-50 drop-shadow-[0_4px_10px_rgb(0_0_0/0.45)] will-change-transform"
      style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
    >
      {kind === "text" && (
        <svg width="18" height="30" viewBox="0 0 18 30" className="-translate-x-[9px] -translate-y-[15px]">
          <path
            d="M4 2h3.5c.8 0 1.5.7 1.5 1.5 0-.8.7-1.5 1.5-1.5H14M4 28h3.5c.8 0 1.5-.7 1.5-1.5 0 .8.7 1.5 1.5 1.5H14M9 4v22M6.5 15h5"
            className="fill-none stroke-dark-100"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M4 2h3.5c.8 0 1.5.7 1.5 1.5 0-.8.7-1.5 1.5-1.5H14M4 28h3.5c.8 0 1.5-.7 1.5-1.5 0 .8.7 1.5 1.5 1.5H14M9 4v22M6.5 15h5"
            className="fill-none stroke-white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
      {kind === "pointer" && (
        <svg width="30" height="32" viewBox="0 0 30 32" className="-translate-x-[11px] -translate-y-[2px]">
          <path
            d="M11 3.5c0-1.4 1-2.5 2.3-2.5s2.3 1.1 2.3 2.5V13l1-.2c1.3-.2 2.3.6 2.5 1.6 1-.6 2.6-.4 3.2.9 1-.4 2.6 0 3 1.6.5 2.6.3 6-1 9-1.3 3-3.6 5.1-7.2 5.1h-2.6c-2.4 0-4.2-1-5.8-3l-5-6.4c-.9-1.2-.6-2.7.6-3.4 1-.6 2.3-.4 3.2.6L11 21V3.5z"
            className="fill-white stroke-dark-100"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M16 19v6M19.2 19v6M22.4 19v5.6" className="stroke-dark-100" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {kind === "arrow" && (
        <svg width="26" height="30" viewBox="0 0 26 30" className="-translate-x-[3px] -translate-y-[2px]">
          <path
            d="M3 2.5v21.7c0 .9 1 1.3 1.6.7l5-4.9 3.4 7.9c.3.7 1.1 1 1.8.7l2.6-1.1c.7-.3 1-1.1.7-1.8l-3.3-7.7h7c.9 0 1.3-1.1.7-1.7L4.7 1.8C4.1 1.2 3 1.6 3 2.5z"
            className="fill-white stroke-dark-100"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
