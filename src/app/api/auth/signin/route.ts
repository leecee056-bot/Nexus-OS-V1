import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  createSession,
  sessionCookieOptions,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth";
import { isUsingSampleDb, sql } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  const limited = rateLimit(`signin:${ip}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Too many sign-in attempts. Retry in ${limited.retryAfterSec}s.` },
      { status: 429 },
    );
  }

  let body: { login?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const login = (body.login || "").trim().toLowerCase();
  const password = body.password || "";
  if (!login || !password) {
    return NextResponse.json(
      { error: "Username/email and password required." },
      { status: 400 },
    );
  }

  const rows = await sql<{
    id: string | number;
    password_hash: string;
    display_jid: string;
  }>(
    `SELECT id, password_hash, display_jid FROM accounts
     WHERE username = $1 OR email = $1
     LIMIT 1`,
    [login],
  );
  const account = rows[0];
  if (!account || !(await verifyPassword(password, account.password_hash))) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  await sql(`UPDATE accounts SET last_login_at = NOW() WHERE id = $1`, [
    account.id,
  ]);
  const sessionId = await createSession(account.id);
  const token = signSessionToken(sessionId);
  const res = NextResponse.json({
    ok: true,
    message: "Signed in. Network servers coming — account reserved.",
    displayJid: `@${account.display_jid}`,
    sampleDb: isUsingSampleDb(),
  });
  res.cookies.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(SESSION_DAYS * 24 * 60 * 60),
  );
  return res;
}
