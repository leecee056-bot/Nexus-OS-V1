# Tri-Cass Network lab / VPS image — Prosody XMPP (off-USB).
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    lua-unbound \
    openssl \
    prosody \
    prosody-modules \
  && rm -rf /var/lib/apt/lists/*

COPY prosody/prosody.cfg.lua /etc/prosody/prosody.cfg.lua
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod 644 /etc/prosody/prosody.cfg.lua \
  && chmod 755 /entrypoint.sh \
  && mkdir -p /var/lib/prosody /etc/prosody/certs \
  && chown -R prosody:prosody /var/lib/prosody /etc/prosody \
  && apt-get update \
  && apt-get install -y --no-install-recommends gosu \
  && rm -rf /var/lib/apt/lists/*

EXPOSE 5222 5269 5280

ENTRYPOINT ["/entrypoint.sh"]
CMD ["prosody", "-F"]
