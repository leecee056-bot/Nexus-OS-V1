# Example microSD layout for Tri-Cass Cardputer ADV

Copy the `tri-cass-vault/` folder to the **root** of a FAT-formatted microSD card
(so the device sees `/tri-cass-vault/...`). Optional: also use `/tri-cass-notes.txt`
for the scratch Notes log (created automatically when you save a note).

```
microSD (root)
├── tri-cass-vault/           ← Knowledge Vault (optional)
│   ├── 00-readme.txt
│   ├── guide.txt
│   ├── glossary.txt
│   └── how-to-boot.txt
└── tri-cass-notes.txt        ← created by Notes app (optional)
```

## Rules

- Plain `.txt` or `.md` only (keep files small — the screen is 240×135).
- At most ~12 files are listed in the hub (first found).
- No card / empty folder: firmware still runs; Vault shows a short hint.
- Alternate paths also work: `/vault/*.txt` or a single `/tri-cass-vault.txt`.

## On the device

Hub → **Vault** → `;`/`'` select file → **Enter** to open.  
Type a word then **Enter** to search (line-by-line, low RAM).

## Larger packs

Add more `.txt` / `.md` into `tri-cass-vault/` the same way. Free public sources
(Gutenberg plain text, Kiwix Wikipedia dumps — extract text for this device)
are listed on the site: **Optional Knowledge Packs**
(`/knowledge-packs` or `public/guides/knowledge-packs.md`). Keep individual
files short for the Cardputer screen.
