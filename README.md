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

## Stack

Next.js 15 · Postgres/PGlite · bcrypt password hashing · httpOnly sessions
