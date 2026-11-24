import { sql } from "@/lib/db";

type Bucket = { count: number; resetAt: number };

const memory = new Map<string, Bucket>();
const MAX_KEYS = 5_000;

function pruneMemory(now: number): void {
  for (const [key, bucket] of memory) {
    if (bucket.resetAt <= now) memory.delete(key);
  }
  if (memory.size > MAX_KEYS) {
    const overflow = memory.size - MAX_KEYS;
    let removed = 0;
    for (const key of memory.keys()) {
      memory.delete(key);
      removed += 1;
      if (removed >= overflow) break;
    }
  }
}

function rateLimitMemory(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (memory.size > 200 || Math.random() < 0.05) pruneMemory(now);

  const existing = memory.get(key);
  if (!existing || existing.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/**
 * Prefer Postgres-backed counters when DATABASE_URL is set so limits hold
 * across instances. Local/dev without DATABASE_URL uses an in-process Map.
 * When DATABASE_URL is set but the DB call fails, fail closed (deny) instead
 * of silently falling back to per-instance memory (HAP-105).
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: boolean; retryAfterSec: number }> {
  if (!process.env.DATABASE_URL?.trim()) {
    return rateLimitMemory(key, limit, windowMs);
  }

  const now = new Date();
  try {
    await sql(`DELETE FROM rate_limits WHERE reset_at <= $1`, [now]);

    const rows = await sql<{ hit_count: number; reset_at: Date | string }>(
      `SELECT hit_count, reset_at FROM rate_limits WHERE bucket_key = $1`,
      [key],
    );
    const row = rows[0];
    const resetAt = row ? new Date(row.reset_at) : null;

    if (!row || !resetAt || resetAt.getTime() <= now.getTime()) {
      const nextReset = new Date(now.getTime() + windowMs);
      await sql(
        `INSERT INTO rate_limits (bucket_key, hit_count, reset_at)
         VALUES ($1, 1, $2)
         ON CONFLICT (bucket_key) DO UPDATE
           SET hit_count = 1, reset_at = EXCLUDED.reset_at`,
        [key, nextReset],
      );
      return { ok: true, retryAfterSec: 0 };
    }

    if (row.hit_count >= limit) {
      return {
        ok: false,
        retryAfterSec: Math.max(
          1,
          Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
        ),
      };
    }

    await sql(
      `UPDATE rate_limits SET hit_count = hit_count + 1 WHERE bucket_key = $1`,
      [key],
    );
    return { ok: true, retryAfterSec: 0 };
  } catch (err) {
    console.error(
      "rate-limit db fail-closed",
      err instanceof Error ? err.message : err,
    );
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil(windowMs / 1000)),
    };
  }
}
