# HAP-68 — Signed offline update bundles

Sneakernet-friendly updates: copy a signed `.tar.zst` + `.sig` to the stick,
verify, apply, keep last-good for rollback. **Scaffold** — keys are operator-
generated; no Tri-Cass private key is in this repo.

## Layout

```
updates/
  tri-cass-update-<version>.tar.zst
  tri-cass-update-<version>.tar.zst.minisig   # or .sig (openssl)
  LAST_GOOD/          # previous tree snapshot after successful apply
  PENDING/            # extracted candidate before promote
```

Payload may include `runtime/`, `catalog/`, `tui/`, `knowledge/`, `VERSION`.

## Tools

| Script | Role |
|--------|------|
| `scripts/updates/gen-keys.sh` | Create minisign (or openssl) keypair offline |
| `scripts/updates/pack-bundle.sh` | Pack staged tree → `.tar.zst` + sign |
| `scripts/updates/verify-bundle.sh` | Verify signature + sha256 |
| `scripts/updates/apply-update.sh` | Verify → stage → promote; keep LAST_GOOD |
| `scripts/updates/rollback-update.sh` | Restore LAST_GOOD |

## Operator flow

```bash
bash scripts/updates/gen-keys.sh          # once, keep secret key offline
bash scripts/updates/pack-bundle.sh ./stage 0.2.0
# copy .tar.zst + .minisig to USB /data/updates/
bash scripts/updates/verify-bundle.sh /data/updates/tri-cass-update-0.2.0.tar.zst
bash scripts/updates/apply-update.sh /data/updates/tri-cass-update-0.2.0.tar.zst
# if bad:
bash scripts/updates/rollback-update.sh
```

Public key ships in-image at `/opt/portable-ai-os/updates/trusted.pub` (placeholder
until release keys exist).
