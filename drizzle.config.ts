import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read .env files; load the local one when it exists (CI passes env directly).
try {
  process.loadEnvFile(".env.local");
} catch {}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
});
