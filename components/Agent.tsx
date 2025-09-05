"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { PhoneOff, Repeat2 } from "lucide-react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
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
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const CALL_CONNECT_TIMEOUT_MS = 15000;

    try {
      if (type === "generate") {
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        if (!workflowId) {
          console.error("Missing NEXT_PUBLIC_VAPI_WORKFLOW_ID");
          throw new Error("Missing workflow id");
        }

        await Promise.race([
          vapi.start(workflowId, {
            variableValues: {
              username: userName,
              userid: userId,
            },
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Connection timeout")),
              CALL_CONNECT_TIMEOUT_MS
            )
          ),
        ]);
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await Promise.race([
          vapi.start(interviewer, {
            variableValues: {
              questions: formattedQuestions,
            },
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Connection timeout")),
              CALL_CONNECT_TIMEOUT_MS
            )
          ),
        ]);
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const handleRepeat = () => {
    if (lastMessage && callStatus === CallStatus.ACTIVE) {
      // Send the last message back to the AI to repeat it
      vapi.say(lastMessage);
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.filter((message) => message.role === "assistant").length >
        0 && (
        <div className="transcript-border">
          <div className="transcript">
            {messages
              .filter((message) => message.role === "assistant")
              .map((message, index) => (
                <p
                  key={`${message.role}-${index}-${message.content}`}
                  className={cn(
                    "mb-2 last:mb-0 transition-opacity duration-500 animate-fadeIn opacity-100"
                  )}
                >
                  {message.content}
                </p>
              ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative flex justify-center items-center">
              {callStatus === "INACTIVE" || callStatus === "FINISHED" ? (
                "Call"
              ) : (
                <div className="loader"></div>
              )}
            </span>
          </button>
        ) : (
          <div className="flex justify-between gap-4">
            <button
              className="btn-repeat flex justify-between gap-1 items-center"
              onClick={() => handleRepeat()}
            >
              <span>
                <Repeat2 />
              </span>
              Repeat
            </button>
            <button
              className="btn-disconnect flex justify-between gap-1 items-center"
              onClick={() => handleDisconnect()}
            >
              <span>
                <PhoneOff />
              </span>
              Leave interview
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Agent;
