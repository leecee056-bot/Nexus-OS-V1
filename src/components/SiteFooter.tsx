import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <p className="disclaimer">
          NEXUS OS is a USB stick you boot into — AI Chat and the other apps run
          on your PC with no cloud required. Online Network chat is optional and
          not live yet; signing up here only reserves a future name.
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
