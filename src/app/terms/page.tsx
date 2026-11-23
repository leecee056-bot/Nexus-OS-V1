import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "Basic terms for using the Tri-Cass OS website and downloading the offline system images.",
};

export default function TermsPage() {
  return (
    <section className="section">
      <div className="shell legal">
        <h2>Terms of use</h2>
        <p className="lede">
          Simple rules for using this website and the Tri-Cass OS downloads. Last
          updated: 19 November 2026.
        </p>

        <h3 className="subhead">The project</h3>
        <p>
          Tri-Cass OS is a portable offline AI system distributed as downloadable
          disk images for PC (USB) and Raspberry Pi (microSD). This website is the
          product home for that project. It is not affiliated with unrelated
          unrelated products or companies that share a similar name.
        </p>

        <h3 className="subhead">Downloads and your hardware</h3>
        <ul className="feature-list">
          <li>
            <strong>You choose the target device</strong>
            <span>
              Flashing an image erases the USB stick or microSD card you select.
              Double-check the target before you write. We are not responsible for
              data loss from flashing the wrong device.
            </span>
          </li>
          <li>
            <strong>Your machine, your risk</strong>
            <span>
              Booting experimental or community software can fail on some
              hardware. Use at your own risk. Images are provided as-is, without
              warranty of fitness for a particular purpose.
            </span>
          </li>
          <li>
            <strong>Licenses inside the image</strong>
            <span>
              Bundled open-source components and models keep their own licenses
              (for example Apache-2.0 for common small GGUF models). Respect those
              terms when you redistribute or modify them.
            </span>
          </li>
        </ul>

        <h3 className="subhead">This website and accounts</h3>
        <p>
          Optional Network signup reserves a username for a future community. Do
          not create accounts to harass others, impersonate people, or abuse the
          service. We may remove or disable accounts that break these rules or
          harm the site. Chat rooms are not online yet; reserving a name does not
          guarantee a particular feature set or launch date.
        </p>

        <h3 className="subhead">Acceptable use</h3>
        <p>
          Do not use the site or software to break the law, attack systems you do
          not own, or distribute malware. The offline OS is meant for personal,
          educational, and makerspace-style use on machines you are allowed to
          boot.
        </p>

        <h3 className="subhead">No warranty</h3>
        <p>
          The website, downloads, and software are provided “as is.” To the
          fullest extent allowed by law, the project maintainers disclaim
          warranties and are not liable for indirect or consequential damages
          arising from use of the site or images.
        </p>

        <h3 className="subhead">Changes</h3>
        <p>
          These terms may be updated as the project grows. The date at the top of
          this page will change when they do. Continued use of the site after an
          update means you accept the revised terms.
        </p>

        <p className="legal-note">
          Related: <Link href="/privacy">Privacy</Link> ·{" "}
          <Link href="/faq">FAQ</Link> · <Link href="/download">Download</Link>
        </p>
      </div>
    </section>
  );
}
