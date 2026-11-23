# Tri-Cass OS product website

Marketing + download + Network account reservation site for **Tri-Cass OS**.

This site is **separate from the USB OS image** — never flash this app onto the stick.

## Local

```bash
env -u DATABASE_URL npm install
env -u DATABASE_URL npm run dev
# http://127.0.0.1:3456
```

Without `DATABASE_URL`, accounts use in-memory PGlite (sample data). Published Cursor apps get Postgres via `cursor-app.json`.

## Network chat server (separate)

Prosody lab/VPS pack lives in [`network/`](network/). The website can reserve
`@user@tri-cass.network` **usernames** (optional email; no password while chat
is offline). Real chat needs that Prosody box on a small VPS with DNS. See
`network/README.md`.

## Source / GPL note for OS images

See [`SOURCES.md`](SOURCES.md) and [`portable-ai-os/`](portable-ai-os/) (build
scripts, hub TUI, [`SBOM.md`](portable-ai-os/SBOM.md)). MIT covers product code
in this repo; bootable images also include GPL components covered by the source
offer. Honest hardware matrix: [`/compat`](src/app/compat/page.tsx).

## Optional Knowledge Packs

Site page [`/knowledge-packs`](src/app/knowledge-packs/page.tsx) and guide
[`public/guides/knowledge-packs.md`](public/guides/knowledge-packs.md) point
users at free public offline sources (Kiwix, Project Gutenberg, etc.) so they
can expand the Knowledge Vault on a USB stick or microSD without us hosting
large dumps. Completely optional.

## Companion app (Windows · iOS · Android)

Secondary installable app in [`nexus-app/`](nexus-app/) — Chat, Vault, Packs,
and Files in a normal UI without flashing USB/Pi media. Android ships as a
sideload APK (EAS preview → GitHub Releases). See
[`nexus-app/README.md`](nexus-app/README.md),
[`public/guides/companion-app.md`](public/guides/companion-app.md), and
[`public/guides/android-apk.md`](public/guides/android-apk.md).

## Stack

Next.js 15 · Postgres/PGlite · bcrypt password hashing · httpOnly sessions

## License

Tri-Cass OS code is licensed under the MIT License — see [`LICENSE`](LICENSE).
