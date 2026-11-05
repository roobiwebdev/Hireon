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
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
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
