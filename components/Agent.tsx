"use client";

import CallView from "@/components/call/CallView";
import { useBrowserInterview } from "@/hooks/useBrowserInterview";
import { useCallCompletion } from "@/hooks/useCallCompletion";
import { useVapiCall } from "@/hooks/useVapiCall";
import { voiceProvider } from "@/lib/voice/provider";

function BrowserAgent(props: AgentProps) {
  const call = useBrowserInterview({ role: props.role, questions: props.questions });
  const { scoring, scoreFailed, retryScoring } = useCallCompletion({
    type: props.type,
    interviewId: props.interviewId,
    status: call.status,
    messages: call.messages,
  });
  return (
    <CallView
      call={call}
      userName={props.userName}
      userImage={props.userImage}
      scoring={scoring}
      scoreFailed={scoreFailed}
      onRetryScoring={retryScoring}
    />
  );
}

function VapiAgent(props: AgentProps) {
  const call = useVapiCall({
    type: props.type,
    userName: props.userName,
    userId: props.userId,
    questions: props.questions,
  });
  const { scoring, scoreFailed, retryScoring } = useCallCompletion({
    type: props.type,
    interviewId: props.interviewId,
    status: call.status,
    messages: call.messages,
  });
  return (
    <CallView
      call={call}
      userName={props.userName}
      userImage={props.userImage}
      scoring={scoring}
      scoreFailed={scoreFailed}
      onRetryScoring={retryScoring}
    />
  );
}

/**
 * SOURCE OF TRUTH KEYWORDS: Agent, interview call, voice provider, call engine switch, NEXT_PUBLIC_VOICE_PROVIDER
 * WHAT:  The interview call: picks the voice engine (free browser voice by default, Vapi when
 *        NEXT_PUBLIC_VOICE_PROVIDER=vapi) and renders the shared CallView.
 * WHY:   Engines differ only in how they speak and listen; scoring and UI are shared.
 * WHERE: app/(root)/interview/[id]/page.tsx, and app/(root)/interview/page.tsx when using Vapi.
 */
export default function Agent(props: AgentProps) {
  return voiceProvider === "vapi" ? <VapiAgent {...props} /> : <BrowserAgent {...props} />;
}
