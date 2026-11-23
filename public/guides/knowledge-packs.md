# Optional Knowledge Packs (offline)

Tri-Cass OS works without these. Use them only if you have spare space on a USB
stick or microSD (32 GB+ is plenty for lots of text) and want more than the
built-in Vault starter notes.

We do **not** host large Wikipedia or coding dumps. Download free public packs
yourself, copy plain text onto your media, and search offline.

Full page: [/knowledge-packs](/knowledge-packs) · Coding section: [/knowledge-packs#coding](/knowledge-packs#coding)

## Quick steps

1. Download plain text (`.txt` / `.md`) from a free source below.
2. Copy into the vault folder for your device (paths below).
3. Boot → **Vault** (PC/Pi: rebuild index if asked; Cardputer: browse / search).
4. **Companion coding packs:** Packs → **Import as coding pack** → Agent uses
   `search_coding_packs`.

## Coding packs (optional)

Best with small local models (~1.5B): look up docs in packs, then use file tools
for short scripts and starters — not large greenfield apps.

| Source | Link | Notes |
|--------|------|--------|
| DevDocs via Kiwix | https://library.kiwix.org/?q=devdocs | Offline API docs (`.zim`). Browse in Kiwix; export useful pages to `.txt`/`.md`. |
| Stack Exchange ZIMs | https://download.kiwix.org/zim/stack_exchange/ | Huge — start with a small topic or a few exported threads. |
| Kiwix library | https://library.kiwix.org/ | Search for DevDocs, Stack Overflow, and other tech ZIMs. |

**USB kit:** drop excerpts in `Knowledge/coding/`, then Import as coding pack in
Companion. Agent Add-on: **Coding Packs** (`search_coding_packs`).

## General public sources

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

**Companion USB kit**

- `Knowledge/` for notes; `Knowledge/coding/` for DevDocs / SO excerpts.
- Import via Companion **Packs** (coding pack tags `pack-coding-*`).

**Cardputer ADV**

- FAT microSD, preferred: `/tri-cass-vault/*.txt` or `*.md` at the card root.
- Also accepted: `/vault/` or a single `/tri-cass-vault.txt`.
- Keep files small; no card required for the rest of the hub.
- Example: `nexus-cardputer/sd-example/`

```
USB / SD knowledge side
├── vault/              ← PC/Pi notes
│   └── guide.txt
├── Knowledge/
│   └── coding/         ← Companion coding excerpts
└── tri-cass-vault/     ← Cardputer preferred
    └── cheatsheet.txt
```

## Tip

Start small. Fill a large stick over time. Huge media-heavy ZIM packs belong in
Kiwix; Vault / Agent search works best with plain text.
