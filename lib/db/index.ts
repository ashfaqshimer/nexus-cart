import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Reuse the postgres client across hot reloads in development to avoid
// exhausting connections.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

// `prepare: false` is required for Neon's PgBouncer pooler (transaction mode
// has no prepared statements); `max: 1` keeps each serverless instance's pool
// tiny so we don't exhaust Neon's free-tier connection cap. Both are harmless
// against a local Postgres.
const client =
  globalForDb.client ?? postgres(connectionString, { prepare: false, max: 1 });
if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
