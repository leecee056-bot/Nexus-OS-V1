import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForms";
import { isUsingSampleDb } from "@/lib/db";

export const metadata: Metadata = { title: "NEXUS Network" };

export default function NetworkPage() {
  const sample = isUsingSampleDb();

  return (
    <section className="section">
      <div className="shell">
        <h2>NEXUS Network</h2>
        <p className="lede">
          Optional online community for NEXUS OS users. The USB stick works fully
          offline without this — Network is extra, for later.
        </p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          Chat rooms are not online yet. Creating an account only{" "}
          <strong>reserves</strong> a name like{" "}
          <span className="mono">@you@nexus.network</span> for when servers
          launch. You can still download and use the USB OS today.
        </div>

        {sample ? (
          <div className="alert" style={{ marginBottom: "1.5rem" }}>
            Local preview uses in-memory sample database (PGlite). Published app
            uses Postgres. Data here is for demo only.
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
              Community vision
            </h3>
            <ul className="feature-list">
              <li>
                <strong>Internet / LAN / offline-queue</strong>
                <span>
                  Modes map to hosted Prosody, LAN Prosody, and client outbox —
                  architecture approved; client not shipped.
                </span>
              </li>
              <li>
                <strong>Identity</strong>
                <span>
                  Real JID style <code className="mono">user@nexus.network</code>
                  , shown as <code className="mono">@user@nexus.network</code>.
                </span>
              </li>
              <li>
                <strong>Privacy</strong>
                <span>
                  Network off by default. Local AI never reads PMs without
                  explicit permission. No invented E2EE claims here.
                </span>
              </li>
            </ul>
            <p style={{ marginTop: "1rem", color: "var(--fg-dim)" }}>
              Already reserved? <Link href="/signin">Sign in</Link>
            </p>
          </div>

          <div className="panel">
            <h3>Create account</h3>
            <p className="hint" style={{ marginBottom: "1rem" }}>
              Username, email, password. Passwords are hashed (bcrypt). This is
              app-native auth — not Cursor login.
            </p>
            <AuthForm mode="signup" />
          </div>
        </div>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nexus-os-mockup-network.png"
            alt="NEXUS Network design mockup"
          />
          <figcaption>
            Network mockup — design target only. Not a live chat client.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
