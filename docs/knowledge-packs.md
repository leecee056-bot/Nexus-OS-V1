# Optional Knowledge Packs

Canonical user-facing copy lives on the site and in the static guide:

- Site: `/knowledge-packs` (`src/app/knowledge-packs/page.tsx`)
- Markdown guide: [`../public/guides/knowledge-packs.md`](../public/guides/knowledge-packs.md)
- Cardputer example layout: [`../nexus-cardputer/sd-example/`](../nexus-cardputer/sd-example/)

## Intent

Keep Tri-Cass images and firmware small. Point people with spare USB / microSD
space (32 GB+) at free public offline archives so they can add Wikipedia-style
knowledge, books, or notes for local Vault search — without hosting multi‑GB
dumps in this repo or on the product site.

## Device paths (summary)

| Target | Path | Format |
|--------|------|--------|
| PC USB / Pi | Knowledge Vault on the stick/card; rebuild index | `.txt` / `.md` |
| Cardputer ADV | `/tri-cass-vault/` (or `/vault/`, or `/tri-cass-vault.txt`) | `.txt` / `.md`, keep short |

`.zim` (Kiwix) is excellent with a Kiwix reader; for Vault / Cardputer prefer
plain text or extracted articles.
