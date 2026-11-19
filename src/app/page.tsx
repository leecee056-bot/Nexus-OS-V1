import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="shell hero-inner">
        <p className="brand-hero cursor-blink">NEXUS OS</p>
        <h1>Your AI computer on a USB stick.</h1>
        <p>
          Download, put it on a stick, boot any spare PC — chat with a local AI,
          manage files, and use built-in tools with no cloud account required.
        </p>
        <div className="cta-row">
          <Link className="btn" href="/download">
            Download
          </Link>
          <Link className="btn btn-ghost" href="/setup">
            Setup guide
          </Link>
          <Link className="btn btn-ghost" href="/network">
            Reserve Network name
          </Link>
        </div>
      </div>
    </section>
  );
}
