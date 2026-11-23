import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Tri-Cass OS — downloads, flashing, offline AI, Raspberry Pi, Tri-Cass Pocket (ESP32), cyberdecks, and the optional Network signup.",
};

export default function FaqPage() {
  return (
    <section className="section">
      <div className="shell">
        <h2>Frequently asked questions</h2>
        <p className="lede">
          Short answers about what Tri-Cass OS is, how to flash PC/Pi images or
          Pocket, and what you need (or don’t need) to get started. Still stuck?
          See <Link href="/setup">Setup</Link> or <Link href="/docs">Docs</Link>.
        </p>

        <div className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <details key={item.id} className="faq-item" id={item.id}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="cta-row" style={{ marginTop: "2.5rem" }}>
          <Link className="btn" href="/download">
            Download
          </Link>
          <Link className="btn btn-ghost" href="/setup">
            Setup guide
          </Link>
          <Link className="btn btn-quiet" href="/about">
            About
          </Link>
        </div>
      </div>
    </section>
  );
}
