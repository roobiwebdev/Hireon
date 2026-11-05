# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Every rule here is mandatory. `AGENTS.md` points here so every agent reads the same rules.

## What this is

HireonAI: an AI mock-interview app. The user has a voice call with an AI interviewer (Vapi), and Gemini then scores the transcript and saves structured feedback. Next.js 15 App Router, React 19, Firebase (Auth + Firestore), Tailwind v4, and shadcn/ui (new-york style).

## 0. How to work

1. **Plan before code.** For any feature, use the `architect-feature` skill. Restate the goal, break it into building blocks, find what already exists, place it at the root, run the security pass, and propose a build order. Get approval before you write implementation code.
2. **Explore cheaply.** Grep for `SOURCE OF TRUTH KEYWORDS` and similar names before reading whole files. Read only what you need.
3. **Reuse before you create.** Before you create a type, function, component, constant or pattern, grep for an existing one. Duplicates are bugs.
4. **Root cause, not symptoms.** Fix a problem where it starts so every caller benefits.
5. **Finish the whole feature.** Never leave a piece half-built. If something is out of scope or blocked, say so explicitly in your handover.
6. **Prove it.** Before you hand over, run `npx tsc --noEmit` and `npm run lint`, plus the evidence for what you touched (see section 7). Report the real results. Never claim a pass you did not see.
7. **Git: task branches only.** For edits, use the `new-feature` skill. Each task gets one worktree and one branch, created from `origin/master` inside the gitignored `.worktrees/` folder: `.worktrees/<task-name>` on branch `agent/<task-name>`. Install dependencies inside the worktree.
   - Agents may create worktrees and branches, commit, and push their **own task branch**.
   - Never commit or push to `master`, and never merge.
   - Never use plain `--force`. Use `--force-with-lease`, and only on your own branch.
   - Open a PR only when the user asks.
   - Read-only work (reviews, explanations, investigations) needs no worktree.
   - **No AI attribution.** Commits and PRs must read as the user's own work: no `Co-Authored-By: Claude` trailer, no "Generated with Claude Code" line, no AI mention in titles or bodies. Commit with the repo's configured git identity.
   - These git rules override any personal or global skill that says otherwise.

## 1. Commands

```bash
npm run dev      # next dev --turbopack (http://localhost:3000)
npm run build
npm run lint     # next lint (eslint next/core-web-vitals + next/typescript)
npx tsc --noEmit # type-check
```

- **The build will not catch errors:** `next.config.ts` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors`. Run `tsc --noEmit` and `lint` yourself to verify changes.
- There is no test suite.
- Both `package-lock.json` and `pnpm-lock.yaml` are committed. Ask before changing dependencies so you update the right lockfile. Resolve lockfile conflicts by regenerating the lockfile, never by hand-merging.

## 2. Environment variables (`.env*` is gitignored)

- Server, used by the Firebase Admin SDK (`firebase/admin.ts`): `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (escaped `\n` is converted to real newlines).
- Client, used by the Firebase web SDK (`firebase/client.ts`): `NEXT_PUBLIC_FIREBASE_*` (API key, auth domain, project ID, storage bucket, messaging sender ID, app ID, measurement ID).
- Vapi: `NEXT_PUBLIC_VAPI_WEB_TOKEN` and `NEXT_PUBLIC_VAPI_WORKFLOW_ID`.
- Gemini via `@ai-sdk/google`: `GOOGLE_GENERATIVE_AI_API_KEY` (the SDK's default variable name).

Only `NEXT_PUBLIC_*` variables may be read in client code.

## 3. Architecture: where code goes

Request flow: **UI → server action (`lib/actions/*.ts`) → Firebase Admin `db` → Firestore.**

```
app/(marketing)/   public landing page at / (copy in constants/landing.ts)
app/(auth)/        sign-in, sign-up (layout redirects signed-in users to /dashboard)
app/(root)/        authenticated pages: /dashboard, /interview/* (layout redirects to /sign-in)
app/api/           route handlers (currently only the Vapi question-generation webhook)
components/        app components; ui/ = shadcn primitives, landing/ = marketing sections, motion/ = animation primitives
lib/actions/       "use server" data + AI logic (the only place that touches Firestore)
firebase/          admin.ts (server SDK), client.ts (web SDK, auth only)
constants/         Vapi assistant config, zod schemas, tech mappings, dummy data
types/             global ambient types (not imported)
```

### Auth: Firebase client SDK plus a server session cookie
1. `components/AuthForm.tsx` signs the user in or up on the client with the Firebase web SDK.
2. On sign-in it gets an ID token and calls the server action `signIn` in `lib/actions/auth.action.ts`. That action calls Admin `createSessionCookie` and sets an httpOnly `session` cookie that lasts one week.
3. Sign-up only writes a `users/{uid}` doc and sends the user to `/sign-in`. It does not log them in.
4. `getCurrentUser()` verifies the cookie and reads `users/{uid}`. This is the only way the server knows who the user is.
5. Route protection lives in the `(root)` and `(auth)` layouts. There is no `middleware.ts`.

### Data access
- All Firestore access happens on the server through the Admin SDK (`db` from `@/firebase/admin`), in the `"use server"` files under `lib/actions/`. Never read or write Firestore from the client. The client SDK is used for Auth only.
- Collections:
  - `users`: `{name, email}`, keyed by uid.
  - `interviews`: `{role, type, level, techstack[], questions[], userId, finalized, coverImage, createdAt}`.
  - `feedback`: `{interviewId, userId, totalScore, categoryScores[], strengths[], areasForImprovement[], finalAssessment, createdAt}`.
- The queries in `general.action.ts` combine `where` and `orderBy`, so they need Firestore composite indexes.

### Interview flow: `components/Agent.tsx` is the hub
`Agent` is a client component that wraps the `vapi` singleton (`lib/vapi.sdk.ts`). It runs in one of two modes:
- **`type="generate"`** (`/interview`): starts the Vapi **workflow** (`NEXT_PUBLIC_VAPI_WORKFLOW_ID`) with `username` and `userid` variables. The workflow collects role, level, techstack, type and amount by voice, then calls `POST /api/vapi/generate` (`app/api/vapi/generate/route.ts`), outside this app's UI. That route asks Gemini for a JSON array of questions, runs `JSON.parse` on the result, and writes an `interviews` doc. When the call ends, the user is sent to `/dashboard`.
- **`type="interview"`** (`/interview/[id]`): starts the inline `interviewer` assistant config from `constants/index.ts`, which uses Deepgram for transcription, 11labs for voice and OpenAI for the model. The interview's questions are injected through the `{{questions}}` variable. Final transcripts are collected into `messages`. When the call ends, the component calls `createFeedback` (Gemini `generateObject` with `feedbackSchema`) and then routes to `/interview/[id]/feedback`.

The questions are read aloud, so the generation prompt forbids special characters such as `/` and `*`. Keep that constraint when editing the prompts.

### Other notes
- The dashboard's "Take an Interview" section currently renders `dummyInterviews`. The real `getLatestInterviews` block is commented out.
- `InterviewCard` is an async server component that fetches its own feedback.
- The path alias `@/*` maps to the repo root.

## 4. Single sources of truth (grep these first)

| Concern | Lives in |
| --- | --- |
| Current user / session | `getCurrentUser()`, `isAuthenticated()` in `lib/actions/auth.action.ts` |
| Firestore reads/writes, Gemini calls | `lib/actions/general.action.ts` (`app/api/vapi/generate/route.ts` for question generation) |
| Domain types (`Interview`, `Feedback`, `User`, props) | `types/index.d.ts` (global ambient, not imported) |
| Vapi message types | `types/vapi.d.ts` |
| Vapi interviewer assistant config | `interviewer` in `constants/index.ts` |
| Feedback AI output schema | `feedbackSchema` (zod) in `constants/index.ts` |
| Tech name → icon mapping | `mappings` in `constants/index.ts` + `getTechLogoUrl` / `getTechLogos` in `lib/utils.ts` |
| Landing page copy and demo data | `constants/landing.ts` (no invented stats or testimonials) |
| Animations | `components/motion/*` (`MotionProvider` with LazyMotion, `Reveal`, `CountUp`). Use `m.*` components, not `motion.*`. |
| Interview cover images | `interviewCovers` + `getRandomInterviewCover` |
| Theme colors, shared CSS classes | `app/globals.css` (`@theme`, `@layer components`, `@utility`) |
| Class merging | `cn()` in `lib/utils.ts` |

If you add an entry to this table's kind of thing (a new collection, schema or shared config), add it here.

## 5. TypeScript

- New or changed code: no `any`, no `!` non-null assertions, no `@ts-ignore` or `@ts-expect-error`, and no `as` casts except `as const`. Narrow `unknown` with type guards. Existing code has many of these. Remove them in code you touch, but don't do unrelated sweeps.
- **Type lookup order:** the existing global types in `types/index.d.ts`, then `z.infer` of an existing zod schema, then library types (Vapi `CreateAssistantDTO`, Firebase). Only then write a new type, in `types/index.d.ts`, with a SOT header.
- `strict` is on. Fix the real type instead of fighting it.

## 6. Validation and security

- **Zod on every input boundary:** every server action argument, every route handler body, every form. Forms use `react-hook-form` with `zodResolver`, matching `AuthForm.tsx`.
- **The user ID always comes from `getCurrentUser()`, never from client input.** Server actions are public endpoints, and any argument can be forged.
- Known gaps (fix them when you touch these files, and don't copy the pattern):
  - `createFeedback`, `getInterviewsByUserId` and `getFeedbackByInterviewId` take `userId` as a parameter instead of reading the session.
  - `POST /api/vapi/generate` is unauthenticated and trusts `userid` from the body, because Vapi calls it directly.
  - AI output is passed to `JSON.parse` without validation.
- Secrets never reach the client: no non-`NEXT_PUBLIC_` env var in a `"use client"` file, and nothing from `firebase/admin` imported into client code.
- Never log secrets, tokens, session cookies or full request bodies or transcripts.

## 7. Proving changes and test evidence

- Always run `npx tsc --noEmit` and `npm run lint`.
- For changed UI or runtime behavior, use the `evidence-driven-testing` skill. Record the failure before the fix and the success after. Evidence goes in the gitignored `.artifacts/<task-name>/`.
- For screenshot pairs, use `before-and-after`. **Keep captures local.** Its `--markdown` option uploads to 0x0.st, a public host, so upload only when the user explicitly asks for PR images, and never for pages that show user data, transcripts or feedback.
- Voice calls need a microphone and live Vapi credentials. If a flow can't be driven, mark it `untested` with the reason instead of claiming it works.

## 8. Source-of-truth comments

Put this header above every new exported, reusable block (functions, components, schemas, server actions):

```ts
/**
 * SOURCE OF TRUTH KEYWORDS: Symbol1, Symbol2, related words (around 6 to 10)
 * WHAT:  what this is
 * WHY:   why it exists and why it is built this way
 * WHERE: where it is used
 */
```

Inline comments explain outcomes and intent, not syntax. Keep them short.

## 9. UI rules

- Check `components/` and `components/ui/` before you create a component. Extend or compose instead of duplicating. Add shadcn primitives with the CLI (the `shadcn` skill) into `components/ui/`.
- Global components take props and slots. Don't hardcode data or copy inside them.
- **Theme tokens only.** Use the colors defined in `app/globals.css` `@theme` (`primary-*`, `dark-*`, `light-*`, `success-*`, `destructive-*`, and the shadcn tokens such as `bg-background` and `text-foreground`) and the shared component classes (`btn-primary`, `card-border`, …). No hex values or `bg-[#...]`.
- When importing shadcn blocks, fix their copy and branding to match HireonAI.
- For complex new components, ask the user for a shadcn block link to use as a reference.
- Icons come from `lucide-react`.
- The `vercel-react-best-practices` and `vercel-composition-patterns` skills apply to React and Next.js work. Use `web-design-guidelines` for UI and accessibility reviews.

## 10. Workflow skills: isolate, build, prove, ship

Pick the steps a task needs. A plan, review or local experiment does not imply a branch, commit or PR.

| Step | Skill | Hireon rule |
| --- | --- | --- |
| Plan | `architect-feature` | Section 0, rule 1. |
| Isolate | `new-feature` | Section 0, rule 7. Base is `origin/master`. |
| Build | `architect-feature` + this file | Sections 3–9. |
| Prove | `evidence-driven-testing` | Section 7. |
| Ship | `before-and-after` | Local captures by default (section 7). |
| Write | `unslop` | Run it over prose you write or edit for a person: commit messages, PR titles and bodies, docs, code comments. Leave text you didn't touch alone. |
| Research | `reverse-engineer-anything` | Use it to study how a feature works in a shipped app or binary, through the `rea` MCP server in `.mcp.json`. Rebuild the behavior here following these rules. Never copy third-party code. |

The project MCP servers in `.mcp.json` are `context7` (current library docs), `shadcn` (component registry) and `rea`.

**Multi-agent rules**
- One worktree and one branch per task and per agent. Never touch another agent's worktree, branch or uncommitted work.
- Before starting, skim open PRs (`gh pr list`, `gh pr diff <n> --name-only`). Independent edits to the same file are fine in your own worktree. Ask when changes conflict in behavior, depend on unfinished work, or ownership is unclear.
- Worktrees do not isolate ports or the Firebase project. Confirm a dev-server port answers your process (`lsof -i :3000`) before you trust it, and never run destructive data experiments against the shared Firestore.
- If you can't resolve a conflict confidently, stop and report instead of guessing.

**Shipping a task (only when asked to ship):** keep the change to the task and run the checks. Commit with a clear message, rebase onto `origin/master` and re-run the checks, then push your branch. Open the PR with what changed, how it was tested (back each claim with evidence), before/after proof, and risks. Do not merge unless told to.

Keep this file up to date when you change structure, commands or conventions.
