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
          Access your reserved Tri-Cass Network identity. Chat servers are not
          online yet — this opens your account profile stub.
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
          No account? <Link href="/network">Create Network account</Link>
        </p>
      </div>
    </section>
  );
}
