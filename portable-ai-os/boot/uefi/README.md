# UEFI boot templates

- `grub.cfg` — menu loaded after shim → GRUB (Secure Boot path).
- Signed `shimx64.efi` / `grubx64.efi` are **not** stored in git; fetch with
  `../../scripts/fetch-uefi-shim.sh` into `../../build/uefi/vendor/`.

See `../../docs/uefi-secure-boot.md`.
