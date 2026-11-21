# Put NEXUS OS on a USB stick (short version)

NEXUS OS is its own small system on a stick. It does **not** install inside Windows.
Full plain-English guide: [/setup](/setup) on the website.

## 1. Download

From https://nexus-os.apps.grok.bot/download or the GitHub Release:

- **i686** — older / 32-bit / XP-era PCs (start here if unsure on old hardware)
- **x86_64** — typical 64-bit PCs

You get a `.img.xz` file (compressed).

## 2. Unpack

- **Windows:** 7-Zip → Extract → get a `.img`
- **Mac/Linux:** `xz -d portable-ai-os-….img.xz`

Do **not** flash the `.xz` file.

## 3. Flash

1. Plug in a USB you can erase (8 GB+ recommended).
2. Open [balenaEtcher](https://etcher.balena.io/).
3. Flash from file → choose the `.img` → select the stick → Flash.

## 4. Boot

1. Restart the PC with the stick plugged in.
2. Open the boot menu (often Esc / F10 / F12) → choose USB.
3. Turn **Secure Boot Off** in BIOS if it will not start.
4. Finish the first-boot questions → use the main menu.

## Optional: more offline knowledge

After you boot and try the built-in Vault starter notes, you can add free
public plain-text packs (Gutenberg books, extracted wiki articles, your own
notes) onto the stick. Completely optional — see
[/knowledge-packs](/knowledge-packs).

## Optional check

**Windows PowerShell** (after unpacking):

```powershell
Get-FileHash .\portable-ai-os-i686.img -Algorithm SHA256
```

Compare to the matching line in SHA256SUMS from the Release.

**Linux/macOS:**

```bash
sha256sum -c SHA256SUMS
```
