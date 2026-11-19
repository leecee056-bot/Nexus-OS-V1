# NEXUS OS product website

Marketing + download + Network account reservation site for **NEXUS OS**.

This site is **separate from the USB OS image** — never flash this app onto the stick.

## Local

```bash
env -u DATABASE_URL npm install
env -u DATABASE_URL npm run dev
# http://127.0.0.1:3456
```

Without `DATABASE_URL`, accounts use in-memory PGlite (sample data). Published Cursor apps get Postgres via `cursor-app.json`.

## Network chat server (separate)

Prosody lab/VPS pack lives in [`network/`](network/). The website reserves `@user@nexus.network` accounts; real chat needs that Prosody box on a small VPS with DNS. See `network/README.md`.

## Stack

Next.js 15 · Postgres/PGlite · bcrypt password hashing · httpOnly sessions
