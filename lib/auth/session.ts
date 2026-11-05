import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./index";

/**
 * SOURCE OF TRUTH KEYWORDS: getCurrentUser, session user, current user, auth check, cached session
 * WHAT:  The signed-in user for this request, or null. Cached per request.
 * WHY:   The only way server code learns who the user is: from the session cookie, never
 *        from a client-supplied id.
 * WHERE: Layouts, pages and lib/actions/*. Use requireUser() when a user is mandatory.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/**
 * SOURCE OF TRUTH KEYWORDS: requireUser, auth guard, security checkpoint, protected action, redirect to sign-in
 * WHAT:  Returns the signed-in user or redirects to /sign-in.
 * WHY:   The one security checkpoint every protected page and server action passes through.
 *        Future plan/tier checks or per-user limits belong here so every caller inherits them.
 * WHERE: app/(root)/layout.tsx and every data function in lib/actions/general.action.ts.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
