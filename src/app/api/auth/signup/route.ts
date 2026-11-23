import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  createSession,
  hashPassword,
  sessionCookieOptions,
  signSessionToken,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import { provisionProsodyAccount } from "@/lib/prosody";
import { rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  clientIpKey,
  csrfRejected,
} from "@/lib/request-guard";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return csrfRejected();

  const ip = clientIpKey(req);
  const limited = await rateLimit(`signup:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Too many signup attempts. Retry in ${limited.retryAfterSec}s.` },
      { status: 429 },
    );
  }

  let body: { username?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const username = (body.username || "").trim().toLowerCase();
  const emailRaw = (body.email || "").trim().toLowerCase();
  const email = emailRaw === "" ? null : emailRaw;
  const password = body.password || "";

  const uErr = validateUsername(username);
  if (uErr) return NextResponse.json({ error: uErr }, { status: 400 });
  if (email) {
    const eErr = validateEmail(email);
    if (eErr) return NextResponse.json({ error: eErr }, { status: 400 });
  }
  const pErr = validatePassword(password);
  if (pErr) return NextResponse.json({ error: pErr }, { status: 400 });

  const displayJid = `${username}@tri-cass.network`;
  const passwordHash = await hashPassword(password);

  try {
    const rows = await sql<{ id: string | number }>(
      `INSERT INTO accounts (username, email, password_hash, display_jid, email_verified)
       VALUES ($1, $2, $3, $4, FALSE)
       RETURNING id`,
      [username, email, passwordHash, displayJid],
    );
    const accountId = rows[0]?.id;
    if (accountId == null) {
      return NextResponse.json({ error: "Could not create account." }, { status: 500 });
    }

    const provision = await provisionProsodyAccount({ username });
    if (!provision.ok) {
      console.error("signup: prosody provision skipped/failed");
    }

    const sessionId = await createSession(accountId);
    const token = signSessionToken(sessionId);
    const liveChat = provision.ok && provision.provisioned;
    const res = NextResponse.json({
      ok: true,
      message: liveChat
        ? "Welcome @" + displayJid + " — Network chat account reserved."
        : "Username reserved for @" +
          displayJid +
          ". Optional email is unique when provided; verification comes later.",
      displayJid: `@${displayJid}`,
      chatProvisioned: liveChat,
      emailVerified: false,
    });
    res.cookies.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(SESSION_DAYS * 24 * 60 * 60),
    );
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/unique|duplicate/i.test(msg)) {
      // Same message for username or email conflict — avoids account enumeration.
      return NextResponse.json(
        { error: "Could not create account with those details." },
        { status: 409 },
      );
    }
    console.error("signup failed");
    return NextResponse.json({ error: "Signup failed." }, { status: 500 });
  }
}
