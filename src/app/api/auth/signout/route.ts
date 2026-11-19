import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  destroySession,
  parseSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    const sessionId = parseSessionToken(raw);
    if (sessionId) await destroySession(sessionId);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
  return res;
}
