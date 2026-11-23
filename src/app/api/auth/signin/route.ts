import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  createSession,
  sessionCookieOptions,
  signSessionToken,
  verifyPasswordOrDummy,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  clientIpKey,
  csrfRejected,
} from "@/lib/request-guard";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return csrfRejected();

  const ip = clientIpKey(req);
  const limited = await rateLimit(`signin:${ip}`, 20, 15 * 60 * 1000);
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

  const byUser = await sql<{
    id: string | number;
    password_hash: string | null;
    display_jid: string;
    reservation_only: boolean | null;
  }>(
    `SELECT id, password_hash, display_jid, reservation_only FROM accounts WHERE username = $1 LIMIT 1`,
    [login],
  );
  let account = byUser[0];
  if (!account) {
    const byEmail = await sql<{
      id: string | number;
      password_hash: string | null;
      display_jid: string;
      reservation_only: boolean | null;
    }>(
      `SELECT id, password_hash, display_jid, reservation_only FROM accounts WHERE email = $1 LIMIT 2`,
      [login],
    );
    if (byEmail.length === 1) account = byEmail[0];
  }

  const ok = await verifyPasswordOrDummy(
    password,
    account?.password_hash ?? null,
  );

  if (!account || !ok) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  if (account.reservation_only || !account.password_hash) {
    return NextResponse.json(
      {
        error:
          "This username is reserved without a password. Sign-in with a password will open when Tri-Cass Network chat launches.",
      },
      { status: 403 },
    );
  }

  await sql(`UPDATE accounts SET last_login_at = NOW() WHERE id = $1`, [
    account.id,
  ]);
  const sessionId = await createSession(account.id);
  const token = signSessionToken(sessionId);
  const res = NextResponse.json({
    ok: true,
    message: "Signed in. Network servers coming — username reserved.",
    displayJid: `@${account.display_jid}`,
  });
  res.cookies.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(SESSION_DAYS * 24 * 60 * 60),
  );
  return res;
}
