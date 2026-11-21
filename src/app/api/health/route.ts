import { NextResponse } from "next/server";

/** Public liveness only — no config / DB mode flags. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    product: "NEXUS OS",
  });
}
