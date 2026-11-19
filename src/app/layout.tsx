import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const SITE_URL = "https://nexus-os.apps.grok.bot";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NEXUS OS — Offline AI for PCs, Pi & cyberdecks",
    template: "%s · NEXUS OS",
  },
  description:
    "NEXUS OS: offline AI on a USB stick or Raspberry Pi — for old PCs, cyberdecks, and low-spec machines. Download, flash with Etcher, boot — local Chat, notes, and tools with no cloud account.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "NEXUS OS",
    title: "NEXUS OS — Offline AI for PCs, Pi & cyberdecks",
    description:
      "Offline AI on a USB stick or Raspberry Pi — for old PCs, cyberdecks, and low-spec machines.",
    images: [
      {
        url: "/brand/og-nexus-os.jpg",
        width: 1200,
        height: 630,
        alt: "NEXUS OS rabbit wizard logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXUS OS — Offline AI for PCs, Pi & cyberdecks",
    description:
      "Offline AI on a USB stick or Raspberry Pi — for old PCs, cyberdecks, and low-spec machines.",
    images: ["/brand/og-nexus-os.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="matrix">
      <head>
        {/* Favicon / apple-touch links come from metadata.icons + app/icon.png */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
