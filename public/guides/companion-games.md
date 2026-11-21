# Companion Games (desktop / USB)

Optional **low-memory** 2D extras for Windows, Mac, web, and the USB portable
kit. Phones skip the Games tab so RAM stays free for Chat.

## What’s included

| Game | Notes |
|------|--------|
| **Chess** | Priority board — local PvP or tiny random-move CPU |
| Snake | Classic grid |
| Pong | One paddle vs simple CPU |
| Breakout | Clear the bricks |
| Tetris | Falling blocks |
| 2048 | Slide / merge tiles |

All are **pure JavaScript** React Native views — no Unity, Love2D, Pygame, or
other engines shipped. Only **one** game mounts at a time; use **Unload** to
drop it from memory.

## Open them

Desktop Companion → **Games** (side rail / Terminal home menu **G**).

## Credits

Inspired by small open-source classics (che55, GameCraft, tinyc.games, and
similar). Each tile links a **Credit** URL in-app — we reimplemented lightly
in-app rather than vendoring those repos.

## Memory tips

- Prefer Chess or one tiny game while chatting elsewhere.
- Unload when finished.
- Image Lab + a heavy Ollama model already use GPU/RAM; keep games as a break,
  not a second engine.
