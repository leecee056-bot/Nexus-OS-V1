import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/AuthForms";
import { getCurrentAccount } from "@/lib/auth";
import { isUsingSampleDb } from "@/lib/db";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/signin");
  const sample = isUsingSampleDb();

  return (
    <section className="section">
      <div className="shell">
        <h2>Account</h2>
        <p className="lede">
          Profile stub for your reserved Network identity. Presence, rooms, and
          messaging unlock when NEXUS Network servers launch.
        </p>
        {sample ? (
          <div className="alert" style={{ marginBottom: "1.5rem" }}>
            Sample data — local PGlite preview database.
          </div>
        ) : null}
        <div className="panel" style={{ maxWidth: "36rem" }}>
          <h3>@{account.display_jid}</h3>
          <p>
            <strong>Username:</strong> {account.username}
            <br />
            <strong>Email:</strong> {account.email}
            <br />
            <strong>Display:</strong>{" "}
            <span className="mono">@{account.display_jid}</span>
            <br />
            <strong>Created:</strong>{" "}
            {new Date(account.created_at).toLocaleString()}
          </p>
          <div className="alert" style={{ marginTop: "1rem" }}>
            Network servers coming — your account is reserved. No live chatrooms
            yet.
          </div>
          <div className="cta-row" style={{ marginTop: "1.25rem" }}>
            <SignOutButton />
            <Link className="btn btn-ghost" href="/download">
              Download OS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
