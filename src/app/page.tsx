import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="shell hero-inner">
        <p className="brand-hero cursor-blink">NEXUS OS</p>
        <h1>Your AI computer. Anywhere.</h1>
        <p>
          Bootable offline-first Linux on a USB stick — Matrix TUI hub, local
          llama.cpp, vault, agents, and games. No cloud required.
        </p>
        <div className="cta-row">
          <Link className="btn" href="/download">
            Download
          </Link>
          <Link className="btn btn-ghost" href="/setup">
            Get started
          </Link>
          <Link className="btn btn-ghost" href="/network">
            Create Network account
          </Link>
        </div>
      </div>
    </section>
  );
}
