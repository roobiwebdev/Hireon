import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

/**
 * SOURCE OF TRUTH KEYWORDS: db, drizzle, neon, database client, postgres, DATABASE_URL
 * WHAT:  The one Drizzle client, talking to Neon Postgres over HTTP.
 * WHY:   The HTTP driver needs no connection pool, which suits serverless functions.
 *        It has no interactive transactions, so writes are single statements (upserts).
 * WHERE: lib/auth/index.ts, lib/actions/*, app/api/*. Server only.
 */
export const db = drizzle(neon(databaseUrl), { schema });
