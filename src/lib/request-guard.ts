import { NextRequest } from "next/server";

/**
 * Client IP for rate limits: prefer the rightmost X-Forwarded-For hop
 * (typically appended by the trusted edge). Never trust the leftmost
 * client-supplied value alone.
 */
export function clientIpKey(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1]!;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/** Block cross-site state-changing requests (CSRF). */
export function assertSameOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host");
  if (!host) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // Browser fetch from our pages always sends Origin. Reject bare POSTs.
  return false;
}

export function csrfRejected(): Response {
  return Response.json(
    { error: "Request blocked (cross-site). Reload the page and try again." },
    { status: 403 },
  );
}
