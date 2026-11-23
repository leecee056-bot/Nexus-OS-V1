# Glossary (plain English)

**USB / SD image (.img)**  
A full disk picture of Tri-Cass OS. You write it to a stick (PC) or microSD card (Pi).

**Flash / Etcher**  
Copying the image onto the stick or card. balenaEtcher is a common free tool. Flashing erases that stick/card.

**Cyberdeck**  
A DIY portable computer, often a Raspberry Pi in a custom case with a small screen and keyboard.

**TUI / hub**  
Text user interface — the full-screen menu after boot. The hub is the main menu.

**AI model / GGUF / llama.cpp**  
The “brain” files for Chat. GGUF is a common file format. llama.cpp is the local engine that runs them.

**SmolLM2**  
The small text model bundled by default so low-RAM machines can still chat.

**Knowledge Vault**  
Your searchable notebook on the device. Indexes `.txt` / `.md` (and PDF text if tools allow). Chat can use hits as context when vault RAG is on.

**Agents & tools**  
Small helpers limited to safe built-in actions (calc, vault, files, notes, sysinfo, models, PXG) — not a free shell on the whole PC.

**Tri-Cass Network**  
Optional future online community. Not needed for offline AI.

**i686 / x86_64 / aarch64**  
CPU types: 32-bit PC, 64-bit PC, and 64-bit Pi (Raspberry Pi image).
