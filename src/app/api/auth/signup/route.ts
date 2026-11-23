import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  createSession,
  sessionCookieOptions,
  signSessionToken,
  validateEmail,
  validateUsername,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  clientIpKey,
  csrfRejected,
} from "@/lib/request-guard";

/**
 * Username (+ optional email) reservation only — no Network password collected
 * while chat rooms are offline (early review trust fix).
 */
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

  // Reject accidental password submission — we no longer store Network passwords
  // at reservation time.
  if (body.password != null && String(body.password).length > 0) {
    return NextResponse.json(
      {
        error:
          "Passwords are not collected for Network reservations yet. Reserve a username only; you will set a password when chat launches.",
      },
      { status: 400 },
    );
  }

  const uErr = validateUsername(username);
  if (uErr) return NextResponse.json({ error: uErr }, { status: 400 });
  if (email) {
    const eErr = validateEmail(email);
    if (eErr) return NextResponse.json({ error: eErr }, { status: 400 });
  }

  const displayJid = `${username}@tri-cass.network`;

  try {
    const rows = await sql<{ id: string | number }>(
      `INSERT INTO accounts (username, email, password_hash, display_jid, email_verified, reservation_only)
       VALUES ($1, $2, NULL, $3, FALSE, TRUE)
       RETURNING id`,
      [username, email, displayJid],
    );
    const accountId = rows[0]?.id;
    if (accountId == null) {
      return NextResponse.json({ error: "Could not create account." }, { status: 500 });
    }

    const sessionId = await createSession(accountId);
    const token = signSessionToken(sessionId);
    const res = NextResponse.json({
      ok: true,
      message:
        "Username reserved for @" +
        displayJid +
        ". No password stored — you will set one when Tri-Cass Network chat launches.",
      displayJid: `@${displayJid}`,
      chatProvisioned: false,
      reservationOnly: true,
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
    if (/unique|duplicate|reservation_only|password_hash/i.test(msg)) {
      // Column missing on old DBs — surface a clear migration hint in logs only.
      if (/reservation_only|password_hash/i.test(msg)) {
        console.error("signup: schema needs migration 004_reservation_only.sql");
        return NextResponse.json(
          { error: "Reservation temporarily unavailable. Try again later." },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: "Could not create account with those details." },
        { status: 409 },
      );
    }
    console.error("signup failed");
    return NextResponse.json({ error: "Signup failed." }, { status: 500 });
  }
}
