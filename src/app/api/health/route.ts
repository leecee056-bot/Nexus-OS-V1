import { NextResponse } from "next/server";
import { isUsingSampleDb } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    ok: true,
    product: "NEXUS OS",
    sampleDb: isUsingSampleDb(),
  });
}
