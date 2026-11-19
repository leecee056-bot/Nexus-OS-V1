-- NEXUS Network — Prosody v1 (lab + production-shaped)
-- Domain: nexus.network  |  MUC: conference.nexus.network
-- Open in-band registration stays OFF (accounts via admin / website provisioner).

admins = { "admin@nexus.network" }

pidfile = "/var/lib/prosody/prosody.pid"
data_path = "/var/lib/prosody"

plugin_paths = { "/usr/share/lua/5.3/prosody-modules", "/usr/lib/prosody/modules" }

modules_enabled = {
  "roster";
  "saslauth";
  "tls";
  "dialback";
  "disco";
  "carbons";
  "pep";
  "private";
  "blocklist";
  "vcard4";
  "vcard_legacy";
  "limits";
  "version";
  "uptime";
  "time";
  "ping";
  "register";
  "mam";
  "smacks";
  "offline";
  "http";
  "http_files";
  "admin_adhoc";
}

modules_disabled = {}

allow_registration = false
c2s_require_encryption = true
s2s_require_encryption = true
s2s_secure_auth = false

authentication = "internal_hashed"
storage = "internal"

archive_expires_after = "4w"

limits = {
  c2s = { rate = "10kb/s" };
  s2sin = { rate = "30kb/s" };
}

http_ports = { 5280 }
http_interfaces = { "*", "::" }

ssl = {
  key = "/etc/prosody/certs/nexus.network.key";
  certificate = "/etc/prosody/certs/nexus.network.crt";
}

VirtualHost "nexus.network"
  enabled = true
  ssl = {
    key = "/etc/prosody/certs/nexus.network.key";
    certificate = "/etc/prosody/certs/nexus.network.crt";
  }

Component "conference.nexus.network" "muc"
  name = "NEXUS Network chatrooms"
  restrict_room_creation = "local"
  -- Lab/v1: allow immediate joins without an unlock form after room create.
  muc_room_locking = false
  muc_room_default_public = true
  muc_room_default_members_only = false
  modules_enabled = { "muc_mam" }
