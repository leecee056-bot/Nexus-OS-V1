#!/usr/bin/env bash
# One-command lab / VPS bring-up for NEXUS Network (Prosody).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  # Generate random lab passwords if still placeholders.
  if grep -q 'change-me-' .env; then
    admin=$(openssl rand -hex 12)
    alice=$(openssl rand -hex 12)
    bob=$(openssl rand -hex 12)
    sed -i \
      -e "s/change-me-admin/${admin}/" \
      -e "s/change-me-alice/${alice}/" \
      -e "s/change-me-bob/${bob}/" \
      .env
    echo "Created .env with random lab passwords (keep this file private)."
  fi
fi

# shellcheck disable=SC1091
set -a && source .env && set +a

DOCKER=(docker)
if ! docker info >/dev/null 2>&1; then
  DOCKER=(sudo docker)
fi

"${DOCKER[@]}" compose up -d --build

echo "Waiting for Prosody..."
for i in $(seq 1 40); do
  if "${DOCKER[@]}" exec nexus-prosody prosodyctl status >/dev/null 2>&1; then
    echo "Prosody is up."
    break
  fi
  sleep 2
  if [[ "$i" -eq 40 ]]; then
    echo "Prosody did not become ready in time." >&2
    "${DOCKER[@]}" compose logs --tail=80
    exit 1
  fi
done

echo "Domain=${NEXUS_XMPP_DOMAIN}  client port=5222"
echo "Smoke: NEXUS_ALICE_PASSWORD=… NEXUS_BOB_PASSWORD=… python3 scripts/smoke_xmpp.py"
