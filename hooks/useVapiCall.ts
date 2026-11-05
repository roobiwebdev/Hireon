"use client";

import { interviewer } from "@/constants";
import { describeCallError } from "@/lib/voice/errors";
import { vapi } from "@/lib/vapi.sdk";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * SOURCE OF TRUTH KEYWORDS: useVapiCall, vapi engine, paid voice, vapi workflow, vapi assistant, call hook
 * WHAT:  Runs a call through Vapi (ElevenLabs voice, Deepgram transcription) and exposes InterviewCallState.
 * WHY:   The original engine, kept for when the Vapi account has credits. Enabled with
 *        NEXT_PUBLIC_VOICE_PROVIDER=vapi; the free browser engine is the default.
 * WHERE: components/Agent.tsx (VapiAgent).
 */
export function useVapiCall({
  type,
  userName,
  userId,
  questions,
}: {
  type: AgentProps["type"];
  userName: string;
  userId?: string;
  questions?: string[];
}): InterviewCallState {
  const [status, setStatus] = useState<CallStatus>("INACTIVE");
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  // The listeners are registered once, so they read status through a ref.
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Vapi reports a failed start twice (error event, then a null result); show the first, more specific one.
  const errorShownRef = useRef(false);
  const showCallError = (error: unknown) => {
    if (errorShownRef.current) return;
    errorShownRef.current = true;
    toast.error(describeCallError(error));
  };

  useEffect(() => {
    const onCallStart = () => setStatus("ACTIVE");
    const onCallEnd = () => setStatus("FINISHED");
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [...prev, { role: message.role, content: message.transcript }]);
      }
    };
    const onSpeechStart = () => setAiSpeaking(true);
    const onSpeechEnd = () => setAiSpeaking(false);
    const onError = (error: unknown) => {
      console.warn("Vapi error", error);
      if (statusRef.current === "CONNECTING") {
        setStatus("INACTIVE");
        showCallError(error);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
    // Registered once; showCallError only touches refs and toast.
  }, []);

  const start = async () => {
    errorShownRef.current = false;
    statusRef.current = "CONNECTING";
    setStatus("CONNECTING");

    try {
      let call: unknown;
      if (type === "generate") {
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        if (!workflowId) throw new Error("Missing NEXT_PUBLIC_VAPI_WORKFLOW_ID");
        call = await vapi.start(undefined, undefined, undefined, workflowId, {
          variableValues: { username: userName, userid: userId },
        });
      } else {
        const formattedQuestions = (questions ?? []).map((question) => `- ${question}`).join("\n");
        call = await vapi.start(interviewer, { variableValues: { questions: formattedQuestions } });
      }
      // vapi.start resolves to null instead of throwing when the call can't be created.
      if (!call) {
        setStatus("INACTIVE");
        showCallError(null);
      }
    } catch (error) {
      setStatus("INACTIVE");
      showCallError(error);
    }
  };

  const end = () => {
    setStatus("FINISHED");
    vapi.stop();
  };

  return {
    status,
    messages,
    aiSpeaking,
    listening: status === "ACTIVE" && !aiSpeaking,
    thinking: false,
    liveCaption: "",
    start: () => void start(),
    end,
  };
}
