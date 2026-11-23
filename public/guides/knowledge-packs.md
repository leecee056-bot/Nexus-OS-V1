# Optional Knowledge Packs (offline)

Tri-Cass OS works without these. Use them only if you have spare space on a USB
stick or microSD (32 GB+ is plenty for lots of text) and want more than the
built-in Vault starter notes.

We do **not** host large Wikipedia dumps. Download free public packs yourself,
copy plain text onto your media, and search offline.

Full page: [/knowledge-packs](/knowledge-packs)

## Quick steps

1. Download plain text (`.txt` / `.md`) from a free source below.
2. Copy into the vault folder for your device (paths below).
3. Boot → **Vault** (PC/Pi: rebuild index if asked; Cardputer: browse / search).

## Public sources

| Source | Link | Notes |
|--------|------|--------|
| Kiwix library | https://library.kiwix.org/ | Offline Wikipedia & more (`.zim`). Great with Kiwix; for Vault, prefer extracted or plain text. |
| Kiwix ZIM index | https://download.kiwix.org/zim/ | Direct downloads (wikipedia, wiktionary, gutenberg, …). |
| Project Gutenberg | https://www.gutenberg.org/ | Public-domain books — use **Plain Text UTF-8**. |
| Gutenberg via Kiwix | https://download.kiwix.org/zim/gutenberg/ | Book collections as ZIM. |

Your own short notes and cheatsheets in `.txt` / `.md` are often the most useful pack.

## Where files go

**PC USB / Raspberry Pi**

- Add `.txt` / `.md` into the Knowledge Vault on the stick or card.
- Open Vault → rebuild the index so new files are searchable.

**Cardputer ADV**

- FAT microSD, preferred: `/tri-cass-vault/*.txt` or `*.md` at the card root.
- Also accepted: `/vault/` or a single `/tri-cass-vault.txt`.
- Keep files small; no card required for the rest of the hub.
- Example: `nexus-cardputer/sd-example/`

```
USB / SD knowledge side
├── vault/              ← PC/Pi notes
│   └── guide.txt
└── tri-cass-vault/        ← Cardputer preferred
    └── cheatsheet.txt
```

## Tip

Start small. Fill a large stick over time. Huge media-heavy ZIM packs belong in
Kiwix; Vault search works best with plain text.
