"use client";

import { createFeedback } from "@/lib/actions/general.action";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * SOURCE OF TRUTH KEYWORDS: useCallCompletion, call finished, generate feedback, score interview, after call redirect
 * WHAT:  When a call finishes: interview calls are scored (createFeedback) and open the report;
 *        setup calls return to the dashboard. Runs once per finished call.
 * WHY:   Both voice engines end the same way, so this lives outside them.
 * WHERE: components/Agent.tsx.
 */
export function useCallCompletion({
  type,
  interviewId,
  status,
  messages,
}: {
  type: AgentProps["type"];
  interviewId?: string;
  status: CallStatus;
  messages: CallMessage[];
}) {
  const router = useRouter();
  const [scoring, setScoring] = useState(false);
  const [scoreFailed, setScoreFailed] = useState(false);
  const handledRef = useRef(false);

  // Keeps the transcript so a failed scoring attempt can be retried instead of losing the interview.
  const score = useCallback(
    (id: string, transcript: CallMessage[]) => {
      setScoring(true);
      setScoreFailed(false);
      void createFeedback({ interviewId: id, transcript }).then((result) => {
        if (result.success) {
          router.push(`/interview/${id}/feedback`);
        } else {
          setScoring(false);
          setScoreFailed(true);
          toast.error("We couldn't score this interview yet. Your answers are saved here; try again.");
        }
      });
    },
    [router]
  );

  useEffect(() => {
    if (status !== "FINISHED") {
      handledRef.current = false;
      return;
    }
    if (handledRef.current) return;
    handledRef.current = true;

    if (type === "generate" || !interviewId) {
      router.push("/dashboard");
      return;
    }

    if (!messages.some((message) => message.role === "user")) {
      toast.info("The interview ended before you answered anything, so there's nothing to score.");
      router.push("/dashboard");
      return;
    }

    score(interviewId, messages);
  }, [status, type, interviewId, messages, router, score]);

  const retryScoring = () => {
    if (interviewId) score(interviewId, messages);
  };

  return { scoring, scoreFailed, retryScoring };
}
