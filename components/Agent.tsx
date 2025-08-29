"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";

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

interface AgentProps {
  userName: string;
  userId: string;
  type: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [message, setMessage] = useState<SavedMessage[]>([]);
  const lastMessage = message[message.length - 1];

  useEffect(() => {
    const onCallStart = () => {
      console.log("Call started");
      setCallStatus(CallStatus.ACTIVE);
    };
    const onCallEnd = () => {
      console.log("Call ended");
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role,
          content: message.transcript,
        };
        setMessage((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error", error);

    // Use proper event names that match VAPI SDK
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
    if (callStatus === CallStatus.FINISHED) {
      router.push("/");
      return;
    }
  }, [callStatus, router]);

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      console.log("Starting call...");

      if (type === "generate") {
        await vapi.start(
          undefined,
          undefined,
          undefined,
          process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
          {
            variableValues: {
              username: userName,
              userid: userId,
            },
          }
        );
      } else {
        // For interview type, you'll need to define these variables
        // or pass them as props to the component
        const questions = [
          "Tell me about yourself",
          "What are your strengths?",
          "Where do you see yourself in 5 years?",
        ];

        const interviewer =
          "You are a professional interviewer. Ask the following questions:";

        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question: string) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    console.log("Disconnecting call...");
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const isInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>

          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avarar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />

            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {message.length > 0 && lastMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage.content}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage.content}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            <span>{isInactiveOrFinished ? "Call" : "..."}</span>
          </button>
        ) : (
          <button
            className="btn-disconnect cursor-pointer"
            onClick={handleDisconnect}
          >
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
