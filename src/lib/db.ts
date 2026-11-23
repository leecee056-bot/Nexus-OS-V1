import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const isProd = process.env.NODE_ENV === "production";
let pool: pg.Pool | undefined;

type GlobalDb = {
  triCassPglite?: Promise<PGlite>;
};

const g = globalThis as typeof globalThis & GlobalDb;

/**
 * Sample/PGlite is for local `next dev` only.
 * Production never falls back to an in-memory DB — DATABASE_URL is required
 * (Cursor sets it when cursor-app.json requests Postgres).
 */
export function isUsingSampleDb(): boolean {
  if (databaseUrl !== "") return false;
  // Never advertise sampleDb in production, even if misconfigured.
  if (isProd) return false;
  return true;
}

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }

  if (isProd) {
    throw new Error(
      "DATABASE_URL is required in production. Refusing ephemeral sample database.",
    );
  }

  g.triCassPglite ??= startLocal().catch((error: unknown) => {
    g.triCassPglite = undefined;
    throw error;
  });
  return (await (await g.triCassPglite).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
