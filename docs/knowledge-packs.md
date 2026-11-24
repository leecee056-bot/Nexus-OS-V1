# Optional Knowledge Packs

Canonical user-facing copy lives on the site and in the static guide:

- Site: `/knowledge-packs` (`src/app/knowledge-packs/page.tsx`)
- Markdown guide: [`../public/guides/knowledge-packs.md`](../public/guides/knowledge-packs.md)
- Cardputer example layout: [`../nexus-cardputer/sd-example/`](../nexus-cardputer/sd-example/)

## Intent

Keep Tri-Cass images and firmware small. Point people with spare USB / microSD
space (32 GB+) at free public offline archives so they can add Wikipedia-style
knowledge, books, coding docs (DevDocs / Stack Overflow via Kiwix), or notes for
local Vault / Agent search — without hosting multi‑GB dumps in this repo or on
the product site.

## Coding packs

- Site anchor: `/knowledge-packs#coding`
- Companion: Packs → **Import as coding pack** → Vault ids `pack-coding-*`
- **Coding pack v1** (curated, ships with Companion + OS knowledge tree):
  `pack-coding-v1-*` / `knowledge/coding-pack-v1/*.md` — auto-seeded; no ZIM required
- Agent tool: `search_coding_packs` (Add-ons → Coding Packs)
- USB kit suggestion: `Knowledge/coding/*.txt|*.md`

## Device paths (summary)

| Target | Path | Format |
|--------|------|--------|
| PC USB / Pi | Knowledge Vault on the stick/card; rebuild index | `.txt` / `.md` |
| Companion USB kit | `Knowledge/` · coding excerpts in `Knowledge/coding/` | `.txt` / `.md` |
| Cardputer ADV | `/tri-cass-vault/` (or `/vault/`, or `/tri-cass-vault.txt`) | `.txt` / `.md`, keep short |

`.zim` (Kiwix) is excellent with a Kiwix reader; for Vault / Cardputer / Agent
prefer plain text or extracted articles.
