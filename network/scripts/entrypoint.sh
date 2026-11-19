#!/bin/bash
set -euo pipefail

DOMAIN="${NEXUS_XMPP_DOMAIN:-nexus.network}"
CERT_DIR=/etc/prosody/certs
KEY="$CERT_DIR/${DOMAIN}.key"
CRT="$CERT_DIR/${DOMAIN}.crt"

mkdir -p "$CERT_DIR" /var/lib/prosody
chown -R prosody:prosody /var/lib/prosody "$CERT_DIR" || true

if [[ ! -f "$KEY" || ! -f "$CRT" ]]; then
  echo "entrypoint: generating self-signed cert for ${DOMAIN}"
  openssl req -x509 -newkey rsa:2048 -sha256 -days 825 -nodes \
    -keyout "$KEY" -out "$CRT" \
    -subj "/CN=${DOMAIN}" \
    -addext "subjectAltName=DNS:${DOMAIN},DNS:conference.${DOMAIN},DNS:localhost" \
    >/dev/null 2>&1
  chown prosody:prosody "$KEY" "$CRT"
  chmod 640 "$KEY" "$CRT"
fi

# Lab / first-boot seed accounts (passwords from env; never bake secrets into the image).
run_ctl() {
  if [[ "$(id -u)" -eq 0 ]]; then
    gosu prosody prosodyctl "$@"
  else
    prosodyctl "$@"
  fi
}

seed_user() {
  local localpart="$1"
  local pass="$2"
  local jid="${localpart}@${DOMAIN}"
  if [[ -z "$pass" ]]; then
    return 0
  fi
  if ! printf '%s\n%s\n' "$pass" "$pass" | run_ctl adduser "$jid" 2>/dev/null; then
    printf '%s\n%s\n' "$pass" "$pass" | run_ctl passwd "$jid" >/dev/null 2>&1 || true
  fi
  echo "entrypoint: ensured account ${jid}"
}

seed_user "admin" "${NEXUS_ADMIN_PASSWORD:-}"
seed_user "alice" "${NEXUS_ALICE_PASSWORD:-}"
seed_user "bob" "${NEXUS_BOB_PASSWORD:-}"

# Prosody refuses to run as root — drop privileges for the daemon.
if [[ "$(id -u)" -eq 0 ]]; then
  exec gosu prosody "$@"
fi
exec "$@"
