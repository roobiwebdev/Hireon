import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

/**
 * SOURCE OF TRUTH KEYWORDS: user, session, account, verification, rateLimit, better auth tables, auth schema
 * WHAT:  Better Auth's core tables plus its database-backed rate-limit counters.
 * WHY:   Better Auth reads and writes these through the Drizzle adapter in lib/auth/index.ts.
 *        The export names (user, session, account, verification, rateLimit) are the model
 *        names Better Auth looks for, so don't rename them.
 * WHERE: lib/auth/index.ts (adapter), lib/auth/session.ts, db/migrations.
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
);

/** Better Auth rate-limit counters (rateLimit.storage = "database"), shared across serverless instances. */
export const rateLimit = pgTable("rate_limit", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

/**
 * SOURCE OF TRUTH KEYWORDS: interview, interviews table, questions, techstack, role, level, Interview type
 * WHAT:  A generated mock interview: its setup and the questions the voice agent will ask.
 * WHY:   Written by the Vapi webhook (app/api/vapi/generate), read by the dashboard and the
 *        interview pages. The `Interview` type in types/index.d.ts is inferred from this table.
 * WHERE: lib/actions/general.action.ts, app/api/vapi/generate/route.ts.
 */
export const interview = pgTable(
  "interview",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    type: text("type").notNull(),
    level: text("level").notNull(),
    techstack: text("techstack").array().notNull(),
    questions: text("questions").array().notNull(),
    finalized: boolean("finalized").default(true).notNull(),
    coverImage: text("cover_image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("interview_user_created_idx").on(t.userId, t.createdAt),
    index("interview_finalized_created_idx").on(t.finalized, t.createdAt),
  ]
);

export type CategoryScore = { name: string; score: number; comment: string };

/**
 * SOURCE OF TRUTH KEYWORDS: feedback, feedback table, scores, categoryScores, totalScore, Feedback type
 * WHAT:  The AI-scored report for one user's attempt at one interview.
 * WHY:   One row per (interview, user): a retake overwrites the previous report, so the
 *        dashboard always shows the latest score. `Feedback` in types/index.d.ts is inferred from it.
 * WHERE: createFeedback / getFeedbackByInterviewId in lib/actions/general.action.ts.
 */
export const feedback = pgTable(
  "feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    interviewId: text("interview_id")
      .notNull()
      .references(() => interview.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    totalScore: integer("total_score").notNull(),
    categoryScores: jsonb("category_scores").$type<CategoryScore[]>().notNull(),
    strengths: text("strengths").array().notNull(),
    areasForImprovement: text("areas_for_improvement").array().notNull(),
    finalAssessment: text("final_assessment").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("feedback_interview_user_idx").on(t.interviewId, t.userId)]
);

export type User = typeof user.$inferSelect;
export type Interview = typeof interview.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
