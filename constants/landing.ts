import { feedbackSchema } from "@/constants";

/**
 * SOURCE OF TRUTH KEYWORDS: landing copy, marketing content, navLinks, faqs, steps, features, hero, demo data
 * WHAT:  All text and demo data shown on the marketing page at `/`.
 * WHY:   Landing components take props; changing the copy means editing this file, not JSX.
 *        Claims here must match what the product actually does (no invented stats or quotes).
 * WHERE: app/(marketing)/page.tsx and components/landing/*.
 */

export const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Questions", href: "#faq" },
] as const;

export const hero = {
  eyebrow: "AI mock interviews, out loud",
  title: "Practice the interview before the interview.",
  subtitle:
    "Tell HireonAI the role you want. It writes the questions, interviews you by voice, and scores every answer so you know what to fix before the real one.",
  primaryCta: { label: "Start practicing", href: "/sign-up" },
  secondaryCta: { label: "See how it works", href: "#how-it-works" },
  points: [
    "Just your browser and a microphone",
    "Questions written for your role and stack",
    "A scored report after every call",
  ],
} as const;

/** Tech names resolved through `mappings` → devicon. Only names whose icon exists. */
export const marqueeTech = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Express",
  "Vue",
  "Angular",
  "Tailwind CSS",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "Firebase",
  "Prisma",
  "NestJS",
  "Sass",
  "Figma",
  "Git",
  "Azure",
] as const;

export const steps = [
  {
    title: "Pick the role",
    body: "Type the job title, pick your level and focus, list your stack and choose how many questions. It takes a few seconds.",
  },
  {
    title: "Talk it through",
    body: "An AI interviewer asks each question, listens to your answer and follows up when you are vague.",
  },
  {
    title: "Read your score",
    body: "When you hang up, you get a 0 to 100 score in five areas, with what went well and what to work on.",
  },
] as const;

/** The five categories the feedback model scores, read from the schema so they never drift. */
export const feedbackCategories = feedbackSchema.shape.categoryScores.items.map(
  (item) => item.shape.name.value
);

export const demoInterview = {
  role: "Frontend Developer",
  level: "Mid-level",
  type: "Technical",
  techstack: ["React", "TypeScript", "Next.js"],
  questions: [
    "Walk me through how React decides when to re-render a component.",
    "How would you type a hook that fetches data in TypeScript?",
    "When would you choose a server component over a client component?",
    "Tell me about a bug that took you a long time to find.",
  ],
  conversation: [
    {
      speaker: "ai",
      text: "Walk me through how React decides when to re-render a component.",
    },
    {
      speaker: "user",
      text: "A component re-renders when its state or props change, or when its parent renders again.",
    },
    {
      speaker: "ai",
      text: "Good. How would you stop a child from re-rendering when nothing it uses changed?",
    },
    {
      speaker: "user",
      text: "I'd wrap it in memo and keep the props it gets stable, like with useCallback.",
    },
  ],
  totalScore: 82,
  scores: [86, 78, 81, 88, 77],
  history: [
    { role: "Frontend Developer", type: "Technical", date: "Today", score: 82, cover: "/covers/spotify.png" },
    { role: "Frontend Developer", type: "Technical", date: "Mon", score: 71, cover: "/covers/spotify.png" },
    { role: "Full Stack Engineer", type: "Mixed", date: "Last week", score: 64, cover: "/covers/reddit.png" },
  ],
} as const;

/** The hero film's story. Timing lives in components/landing/demo/script.ts; the words live here. */
export const heroFilm = {
  candidate: "Roobi",
  interviewId: "k7f2q9",
  techstack: "React, TypeScript, Next.js",
  questionCount: 5,
  date: "Nov 6, 2026, 4:12 PM",
  chapters: ["Pick the role", "Start the call", "Talk it through", "Follow-ups", "Your score", "What to fix"],
  captions: [
    "Name the job. That's the whole setup.",
    "Questions written for your role and stack.",
    "It asks out loud. You answer out loud.",
    "It follows up, like a real interviewer would.",
    "Hang up, and get a score out of 100.",
    "Know exactly what to fix before the real one.",
  ],
  strengths: [
    "Clear on what makes React re-render",
    "Knew when memo and useCallback help",
    "Calm, structured answers",
  ],
  improvements: [
    "Back answers with a real project",
    "Explain the cost of memoising everything",
    "Mention the Profiler for finding re-renders",
  ],
  ariaLabel:
    "Demo of a HireonAI interview: typing Frontend Developer into the setup form, picking Mid-level and a React, TypeScript and Next.js stack, starting a voice call where the AI interviewer asks about React re-renders, the candidate answers out loud with live captions, the interviewer asks a follow-up, and after hanging up the feedback page scores the interview 82 out of 100 across five areas with strengths and areas to improve.",
} as const;

export const features = [
  {
    id: "questions",
    eyebrow: "Questions",
    title: "Written for the job you want.",
    body: "Questions come from the role, level and stack you name, so a junior React interview sounds nothing like a senior DevOps one. You choose technical, behavioural or a mix.",
    points: ["Any role or level", "Technical, behavioural or mixed", "You pick how many"],
  },
  {
    id: "feedback",
    eyebrow: "Feedback",
    title: "A score you can actually act on.",
    body: "Every call ends with a report built from your transcript. Each area gets a score and a comment, followed by your strengths and a short list of what to improve.",
    points: ["Scored 0 to 100", "A comment for each area", "Strengths and next steps"],
  },
  {
    id: "retake",
    eyebrow: "Practice",
    title: "Retake it until it feels easy.",
    body: "Every interview stays on your dashboard. Open the feedback, run the same interview again, and see whether the weak spots moved.",
    points: ["Your interviews in one place", "One click to retake", "New feedback every time"],
  },
] as const;

export const faqs = [
  {
    question: "Do I need to install anything?",
    answer:
      "No. HireonAI runs in your browser. Use Chrome, Edge or Safari, and allow microphone access when the call starts.",
  },
  {
    question: "What kinds of interviews can I practice?",
    answer:
      "Any role and level. You pick the tech stack and whether the questions lean technical, behavioural or a mix of both.",
  },
  {
    question: "How is my answer scored?",
    answer: `After the call, your transcript is scored from 0 to 100 in five areas: ${feedbackCategories.join(", ")}. You also get your strengths, areas to improve and an overall assessment.`,
  },
  {
    question: "Can I retake an interview?",
    answer:
      "Yes. Open any interview's feedback and choose Retake Interview. You get a fresh score each time.",
  },
  {
    question: "How long does an interview take?",
    answer:
      "That depends on how many questions you ask for and how long you talk. You choose the number when you set the interview up.",
  },
] as const;

export const finalCta = {
  title: "Your next interview is closer than you think.",
  body: "Run a practice round today and walk into the real one knowing what to expect.",
  cta: { label: "Start practicing", href: "/sign-up" },
} as const;

export const footerLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Questions", href: "#faq" },
  { label: "Sign in", href: "/sign-in" },
] as const;
