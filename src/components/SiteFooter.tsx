import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <p className="disclaimer">
          NEXUS OS is an offline-first portable AI Linux USB OS. AI runs locally
          on your machine — no cloud required for Chat, Vault, Agents, or Games.
          NEXUS Network is optional and off by default; chat servers are not live
          yet. Account signup on this site reserves future Network identity only.
        </p>
        <p className="disclaimer" style={{ marginTop: "0.85rem" }}>
          Not affiliated with unrelated products or companies that use the name
          “Nexus.” This site is the product home for the USB OS project.
        </p>
        <p style={{ marginTop: "1.25rem" }}>
          <Link href="/download">Download</Link>
          {" · "}
          <Link href="/setup">Setup</Link>
          {" · "}
          <Link href="/network">Create Network account</Link>
          {" · "}
          <Link href="/docs">Docs</Link>
        </p>
      </div>
    </footer>
  );
}
