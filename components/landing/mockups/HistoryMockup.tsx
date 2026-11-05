import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import MockupFrame from "./MockupFrame";

/**
 * SOURCE OF TRUTH KEYWORDS: HistoryMockup, interview history, dashboard preview, retake, score badge, past interviews
 * WHAT:  A preview of the dashboard's interview list with scores and a retake action.
 * WHY:   Shows progress over repeated practice, which is the reason to come back.
 * WHERE: The "retake" FeatureRow on app/(marketing)/page.tsx.
 */
export default function HistoryMockup({
  items,
}: {
  items: ReadonlyArray<{ role: string; type: string; date: string; score: number; cover: string }>;
}) {
  return (
    <MockupFrame title="Your interviews">
      <ul className="flex list-none flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={`${item.role}-${item.date}`}
            className={cn(
              "flex items-center gap-4 rounded-2xl border p-3 sm:p-4",
              i === 0 ? "border-primary-200/30 bg-primary-200/5" : "border-primary-200/10 bg-dark-200/40"
            )}
          >
            <Image src={item.cover} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-primary-100">{item.role}</p>
              <p className="text-xs">
                {item.type} · {item.date}
              </p>
            </div>
            <span className="tabular-nums text-sm font-semibold text-primary-100">
              {item.score}
              <span className="text-light-400">/100</span>
            </span>
            {i === 0 && (
              <span className="hidden items-center gap-1.5 rounded-full bg-primary-200 px-3 py-1.5 text-xs font-bold text-dark-100 sm:flex">
                <RotateCcw className="size-3" aria-hidden />
                Retake
              </span>
            )}
          </li>
        ))}
      </ul>
    </MockupFrame>
  );
}
