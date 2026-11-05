/**
 * SOURCE OF TRUTH KEYWORDS: Interview, Feedback, User, domain types, inferred types, drizzle select types
 * WHAT:  Global aliases for the database row types, inferred from db/schema.ts.
 * WHY:   The schema is the single source of truth; these aliases keep existing global usages working.
 * WHERE: Anywhere in the app (ambient, no import needed).
 */
type Interview = import("@/db/schema").Interview;
type Feedback = import("@/db/schema").Feedback;
type User = import("@/db/schema").User;

interface InterviewCardProps {
  id?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: Date | string;
}

interface AgentProps {
  userName: string;
  userImage?: string | null;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  role?: string;
  questions?: string[];
}

/**
 * SOURCE OF TRUTH KEYWORDS: CallMessage, transcript line, call transcript, CallStatus, InterviewCallState, voice engine contract
 * WHAT:  The contract every voice engine (Vapi or free browser voice) returns to the call screen.
 * WHY:   components/Agent.tsx renders one CallView no matter which engine runs the call.
 * WHERE: hooks/useVapiCall.ts, hooks/useBrowserInterview.ts, hooks/useCallCompletion.ts, components/call/CallView.tsx.
 */
interface CallMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

type CallStatus = "INACTIVE" | "CONNECTING" | "ACTIVE" | "FINISHED";

interface InterviewCallState {
  status: CallStatus;
  messages: CallMessage[];
  /** The interviewer is talking. */
  aiSpeaking: boolean;
  /** The candidate's microphone is open. */
  listening: boolean;
  /** Waiting on the interviewer's next line. */
  thinking: boolean;
  /** Live words while the candidate speaks (browser engine only). */
  liveCaption: string;
  start: () => void;
  end: () => void;
  /** Ends the current answer early ("I'm done"). Only the browser engine supports it. */
  finishAnswer?: () => void;
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}
