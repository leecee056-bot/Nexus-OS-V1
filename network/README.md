# NEXUS Network (Prosody)

Off-USB XMPP server for NEXUS OS. The website at https://nexus-os.apps.grok.bot reserves accounts; this folder is the real chat server.

## Lab / VPS bring-up

```bash
cd network
chmod +x scripts/*.sh
./scripts/bring-up.sh
python3 -m pip install --user slixmpp
set -a && source .env && set +a
python3 scripts/smoke_xmpp.py
```

Optional website → Prosody link (on the same VPS):

```bash
export PROSODY_PROVISION_TOKEN='long-random-token'
node scripts/provision-api.mjs
# Then set on the published site secrets:
#   PROSODY_PROVISION_URL=https://your-vps/provision  (or tunnel)
#   PROSODY_PROVISION_TOKEN=same-token
```

## Ports

| Port | Use |
|------|-----|
| 5222 | Chat clients |
| 5269 | Server federation (optional) |
| 5280 | HTTP helpers |

## Honesty

Until DNS for `nexus.network` points at a public VPS running this stack, Network is **lab-only**. Do not claim live chatrooms on the product site.
