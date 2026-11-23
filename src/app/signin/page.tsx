import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForms";
import { isUsingSampleDb } from "@/lib/db";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  const sample = isUsingSampleDb();

  return (
    <section className="section">
      <div className="shell">
        <h2>Sign in</h2>
        <p className="lede">
          Sign in only if you already set a Network password (older accounts).
          New username reservations do not use a password until chat launches.
        </p>
        {sample ? (
          <div className="alert" style={{ marginBottom: "1.5rem" }}>
            Sample database mode (PGlite) — accounts created in this preview
            session only.
          </div>
        ) : null}
        <div className="panel" style={{ maxWidth: "28rem" }}>
          <AuthForm mode="signin" />
        </div>
        <p style={{ marginTop: "1.25rem", color: "var(--fg-dim)" }}>
          Need a handle? <Link href="/network">Reserve a username</Link>
        </p>
      </div>
    </section>
  );
}
