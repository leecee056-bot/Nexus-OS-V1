import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth";
import { isUsingSampleDb } from "@/lib/db";

export async function GET() {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ account: null, sampleDb: isUsingSampleDb() });
  }
  return NextResponse.json({
    account: {
      username: account.username,
      email: account.email,
      displayJid: `@${account.display_jid}`,
      createdAt: account.created_at,
    },
    sampleDb: isUsingSampleDb(),
  });
}
