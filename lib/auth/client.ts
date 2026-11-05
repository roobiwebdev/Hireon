import { createAuthClient } from "better-auth/react";

/**
 * SOURCE OF TRUTH KEYWORDS: authClient, auth client, signIn, signUp, signOut, social sign in, browser auth
 * WHAT:  The browser-side Better Auth client. Talks to /api/auth on whatever origin serves the page.
 * WHY:   One client for every auth call from the UI; no base URL so it works on localhost,
 *        previews and hireon.roobi.dev alike.
 * WHERE: components/AuthForm.tsx, components/SignOutButton.tsx.
 */
export const authClient = createAuthClient();
