import "server-only";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

const DAY = 60 * 60 * 24;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/** Google sign-in only turns on when both keys exist, so a missing secret never shows a broken button. */
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

// Production pins BETTER_AUTH_URL to the custom domain. Previews fall back to their branch URL.
const vercelBranchUrl = process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`;
const vercelDeploymentUrl = process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`;
const baseURL =
  process.env.BETTER_AUTH_URL ?? vercelBranchUrl ?? vercelDeploymentUrl ?? "http://localhost:3000";

/**
 * SOURCE OF TRUTH KEYWORDS: auth, betterAuth, auth config, google sign in, email password, session cookie, drizzle adapter
 * WHAT:  The Better Auth server instance: email/password + Google, sessions stored in Neon.
 * WHY:   Replaces Firebase Auth. Sessions are httpOnly cookies validated on the server, and
 *        auth endpoints are rate limited in the database so limits hold across serverless instances.
 * WHERE: app/api/auth/[...all]/route.ts (HTTP handler), lib/auth/session.ts (server reads).
 */
export const auth = betterAuth({
  appName: "HireonAI",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [baseURL, vercelBranchUrl, vercelDeploymentUrl].filter(
    (origin): origin is string => typeof origin === "string" && origin.length > 0
  ),
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {},
  session: {
    expiresIn: 7 * DAY,
    updateAge: DAY,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: { enabled: true, storage: "database" },
  plugins: [nextCookies()],
});
