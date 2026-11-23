import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForms";
import { isUsingSampleDb } from "@/lib/db";

export const metadata: Metadata = { title: "Tri-Cass Network" };

export default function NetworkPage() {
  const sample = isUsingSampleDb();

  return (
    <section className="section">
      <div className="shell">
        <h2>Tri-Cass Network</h2>
        <p className="lede">
          An optional online community for people using Tri-Cass OS. You do{" "}
          <strong>not</strong> need this to download or run the USB / Pi system —
          offline AI works without it.
        </p>

        <div className="alert" style={{ marginBottom: "1.5rem" }}>
          Chat rooms are <strong>not online yet</strong>. You can still reserve a
          username now (free) for when the community launches — like{" "}
          <span className="mono">@you@tri-cass.network</span>. Email is contact only
          and not verified yet. Prefer to skip this?{" "}
          <Link href="/download">Download Tri-Cass OS</Link> and use it offline
          today.
        </div>

        {sample ? (
          <div className="alert" style={{ marginBottom: "1.5rem" }}>
            Local preview uses sample data only. The published site keeps
            reservations in its real database.
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
              Why reserve a name?
            </h3>
            <ul className="feature-list">
              <li>
                <strong>Claim your handle early</strong>
                <span>
                  Pick a username you like before rooms open. It is saved for the
                  future community, not required for Chat on the stick or Pi.
                </span>
              </li>
              <li>
                <strong>How it will look</strong>
                <span>
                  Names will look like{" "}
                  <code className="mono">@you@tri-cass.network</code> — a simple
                  online identity for Tri-Cass users.
                </span>
              </li>
              <li>
                <strong>Privacy first</strong>
                <span>
                  Network stays off by default on the device. Local AI does not
                  read your private messages unless you allow it. We do not claim
                  fancy “unbreakable encryption” features that are not built yet.
                </span>
              </li>
              <li>
                <strong>Online, home network, or catch-up later</strong>
                <span>
                  The plan is: chat over the internet when available, talk on a
                  local network at home or a makerspace, and queue messages when
                  you are offline. The phone/desktop chat app for that is still
                  being built.
                </span>
              </li>
            </ul>
            <p style={{ marginTop: "1rem", color: "var(--fg-dim)" }}>
              Already reserved? <Link href="/signin">Sign in</Link>
            </p>
          </div>

          <div className="panel">
            <h3>Create Network account</h3>
            <p className="hint" style={{ marginBottom: "1rem" }}>
              Choose a username, email, and password (at least 10 characters).
              Passwords are stored hashed. This signup is for Tri-Cass Network only —
              it is separate from any other account you may have.
            </p>
            <AuthForm mode="signup" />
          </div>
        </div>

        <figure className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/tri-cass-os-mockup-network.png"
            alt="Tri-Cass Network design mockup"
          />
          <figcaption>
            Network mockup — design target only. Not a live chat client.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
