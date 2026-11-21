import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { sql } from "./db";

const SESSION_COOKIE = "nexus_session";
const SESSION_DAYS = 30;
const USERNAME_RE = /^[a-z][a-z0-9_]{2,23}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Account = {
  id: string;
  username: string;
  email: string | null;
  display_jid: string;
  created_at: string;
  last_login_at: string | null;
};

export function validateUsername(username: string): string | null {
  if (!USERNAME_RE.test(username)) {
    return "Username: 3–24 chars, start with a letter, lowercase a–z, 0–9, _ only.";
  }
  const reserved = new Set([
    "admin",
    "root",
    "nexus",
    "system",
    "support",
    "null",
    "undefined",
  ]);
  if (reserved.has(username)) return "That username is reserved.";
  return null;
}

export function validateEmail(email: string): string | null {
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 128) return "Password is too long.";
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Ephemeral only for local/dev sample runs — never shipped as a fixed value. */
let ephemeralDevSecret: string | null = null;

function sessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set. Add it in Cursor app secrets before serving auth.",
    );
  }

  if (!ephemeralDevSecret) {
    ephemeralDevSecret = randomBytes(32).toString("hex");
  }
  return ephemeralDevSecret;
}

export function signSessionToken(sessionId: string): string {
  const sig = createHash("sha256")
    .update(`${sessionId}:${sessionSecret()}`)
    .digest("hex");
  return `${sessionId}.${sig}`;
}

export function parseSessionToken(token: string): string | null {
  const [sessionId, sig] = token.split(".");
  if (!sessionId || !sig) return null;
  const expected = createHash("sha256")
    .update(`${sessionId}:${sessionSecret()}`)
    .digest("hex");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return sessionId;
}

export async function createSession(accountId: string | number): Promise<string> {
  const id = randomBytes(32).toString("hex");
  const expires = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  await sql(
    `INSERT INTO sessions (id, account_id, expires_at) VALUES ($1, $2, $3)`,
    [id, accountId, expires],
  );
  return id;
}

export async function destroySession(sessionId: string): Promise<void> {
  await sql(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export async function getAccountFromSession(
  sessionId: string,
): Promise<Account | null> {
  const rows = await sql<{
    id: string | number;
    username: string;
    email: string | null;
    display_jid: string;
    created_at: string;
    last_login_at: string | null;
    expires_at: string;
  }>(
    `SELECT a.id, a.username, a.email, a.display_jid, a.created_at, a.last_login_at, s.expires_at
     FROM sessions s
     JOIN accounts a ON a.id = s.account_id
     WHERE s.id = $1`,
    [sessionId],
  );
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await destroySession(sessionId);
    return null;
  }
  return {
    id: String(row.id),
    username: row.username,
    email: row.email,
    display_jid: row.display_jid,
    created_at: row.created_at,
    last_login_at: row.last_login_at,
  };
}

export async function getCurrentAccount(): Promise<Account | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const sessionId = parseSessionToken(raw);
  if (!sessionId) return null;
  return getAccountFromSession(sessionId);
}

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  };
}

export { SESSION_COOKIE, SESSION_DAYS };
