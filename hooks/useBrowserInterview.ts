"use client";

import { interviewer } from "@/constants";
import { getInterviewerTurn } from "@/lib/actions/interview.action";
import { isBrowserVoiceSupported, listen, speak } from "@/lib/voice/browser";
import { describeCallError } from "@/lib/voice/errors";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CLOSING_LINE =
  "That's all my questions. Thank you for your time today. I'm putting your feedback together now.";

/**
 * SOURCE OF TRUTH KEYWORDS: useBrowserInterview, free interview, browser voice engine, interview loop, follow ups, speech
 * WHAT:  Runs a full mock interview in the browser: greets, asks each question aloud, listens to the
 *        answer, lets Gemini add at most one follow-up, then closes. Exposes InterviewCallState.
 * WHY:   Free alternative to Vapi: voice comes from the browser, and only short Gemini calls
 *        (free tier) decide follow-ups. Every step checks for "ended" so End stops everything at once.
 * WHERE: components/Agent.tsx (BrowserAgent), the default engine.
 */
export function useBrowserInterview({
  role,
  questions,
}: {
  role?: string;
  questions?: string[];
}): InterviewCallState {
  const [status, setStatus] = useState<CallStatus>("INACTIVE");
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [liveCaption, setLiveCaption] = useState("");

  const endedRef = useRef(false);
  const callAbortRef = useRef<AbortController | null>(null);
  const answerAbortRef = useRef<AbortController | null>(null);

  const stopEverything = useCallback(() => {
    endedRef.current = true;
    answerAbortRef.current?.abort();
    callAbortRef.current?.abort();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setAiSpeaking(false);
    setListening(false);
    setThinking(false);
    setLiveCaption("");
  }, []);

  // Leaving the page mid-interview must silence the voice and release the microphone.
  useEffect(() => stopEverything, [stopEverything]);

  const run = async () => {
    const callSignal = callAbortRef.current?.signal;

    const say = async (text: string) => {
      if (endedRef.current) return;
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
      setAiSpeaking(true);
      await speak(text, callSignal);
      setAiSpeaking(false);
    };

    const hear = async () => {
      if (endedRef.current) return "";
      const answerAbort = new AbortController();
      answerAbortRef.current = answerAbort;
      callSignal?.addEventListener("abort", () => answerAbort.abort(), { once: true });
      setListening(true);
      try {
        const text = await listen({ signal: answerAbort.signal, onPartial: setLiveCaption });
        if (text && !endedRef.current) setMessages((prev) => [...prev, { role: "user", content: text }]);
        return text;
      } finally {
        setListening(false);
        setLiveCaption("");
      }
    };

    const interviewerTurn = async (question: string, answer: string, followUpsAsked: number) => {
      setThinking(true);
      try {
        return await getInterviewerTurn({ role: role ?? "", question, answer, followUpsAsked });
      } finally {
        setThinking(false);
      }
    };

    await say(`${interviewer.firstMessage ?? "Hello, thanks for joining."} Let's begin.`);

    for (const question of questions ?? []) {
      if (endedRef.current) return;
      await say(question);
      const answer = await hear();
      if (endedRef.current) return;

      if (!answer) {
        await say("No problem, let's move on.");
        continue;
      }

      const turn = await interviewerTurn(question, answer, 0);
      await say(turn.say);
      if (turn.action === "follow_up") {
        const followUpAnswer = await hear();
        if (endedRef.current) return;
        const closing = await interviewerTurn(question, followUpAnswer, 1);
        await say(closing.say);
      }
    }

    await say(CLOSING_LINE);
    if (!endedRef.current) setStatus("FINISHED");
  };

  const start = async () => {
    if (!isBrowserVoiceSupported()) {
      toast.error(describeCallError(new Error("speech-unsupported")));
      return;
    }

    endedRef.current = false;
    callAbortRef.current = new AbortController();
    setMessages([]);
    setStatus("CONNECTING");

    try {
      // Ask for the microphone up front so a blocked mic fails here, before the interviewer starts talking.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      setStatus("INACTIVE");
      toast.error(describeCallError(error));
      return;
    }

    setStatus("ACTIVE");
    try {
      await run();
    } catch (error) {
      stopEverything();
      setStatus("INACTIVE");
      toast.error(describeCallError(error));
    }
  };

  const end = () => {
    stopEverything();
    setStatus("FINISHED");
  };

  return {
    status,
    messages,
    aiSpeaking,
    listening,
    thinking,
    liveCaption,
    start: () => void start(),
    end,
    finishAnswer: () => answerAbortRef.current?.abort(),
  };
}
