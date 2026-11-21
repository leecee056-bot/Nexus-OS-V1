# Example microSD layout for NEXUS Cardputer ADV

Copy the `nexus-vault/` folder to the **root** of a FAT-formatted microSD card
(so the device sees `/nexus-vault/...`). Optional: also use `/nexus-notes.txt`
for the scratch Notes log (created automatically when you save a note).

```
microSD (root)
├── nexus-vault/           ← Knowledge Vault (optional)
│   ├── 00-readme.txt
│   ├── guide.txt
│   ├── glossary.txt
│   └── how-to-boot.txt
└── nexus-notes.txt        ← created by Notes app (optional)
```

## Rules

- Plain `.txt` or `.md` only (keep files small — the screen is 240×135).
- At most ~12 files are listed in the hub (first found).
- No card / empty folder: firmware still runs; Vault shows a short hint.
- Alternate paths also work: `/vault/*.txt` or a single `/nexus-vault.txt`.

## On the device

Hub → **Vault** → `;`/`'` select file → **Enter** to open.  
Type a word then **Enter** to search (line-by-line, low RAM).
