import { z } from "zod";

export const interviewLevels = ["Junior", "Mid-level", "Senior"] as const;
export const interviewTypes = ["Technical", "Behavioural", "Mixed"] as const;

/**
 * SOURCE OF TRUTH KEYWORDS: interviewSetupSchema, interview setup, role, level, techstack, amount, interview form validation
 * WHAT:  Validation for the inputs that define an interview (role, level, type, stack, question count).
 * WHY:   The setup form, the createInterview action and the Vapi webhook all accept the same
 *        shape; one schema keeps their limits identical. Safe to import on client and server.
 * WHERE: components/InterviewSetupForm.tsx, lib/actions/interview.action.ts, app/api/vapi/generate/route.ts.
 */
export const interviewSetupSchema = z.object({
  role: z.string().trim().min(2, "Enter the job title").max(80),
  level: z.string().trim().min(1, "Pick a level").max(40),
  type: z.string().trim().min(1, "Pick a type").max(40),
  techstack: z.string().trim().min(1, "Add at least one technology").max(200),
  amount: z.coerce.number().int().min(1).max(15),
});

export type InterviewSetup = z.infer<typeof interviewSetupSchema>;

/** "React, Next.js ,  " → ["React", "Next.js"] */
export const splitTechstack = (techstack: string) =>
  techstack
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);
