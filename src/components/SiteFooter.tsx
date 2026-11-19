import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <p className="disclaimer">
          NEXUS OS boots from a USB stick (PC) or microSD card (Raspberry Pi). AI
          Chat and the other apps run on that machine with no cloud required.
          Online Network chat is optional and not live yet — signing up here only
          reserves a future username.
        </p>
        <p className="disclaimer" style={{ marginTop: "0.85rem" }}>
          Not affiliated with unrelated products or companies that use the name
          “Nexus.” This site is the product home for the NEXUS OS project.
        </p>
        <p style={{ marginTop: "1.25rem" }}>
          <Link href="/download">Download</Link>
          {" · "}
          <Link href="/setup">Setup</Link>
          {" · "}
          <Link href="/about">About</Link>
          {" · "}
          <Link href="/docs">Docs</Link>
          {" · "}
          <Link href="/network">Optional username (later)</Link>
        </p>
      </div>
    </footer>
  );
}
