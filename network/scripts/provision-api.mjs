#!/usr/bin/env node
/**
 * Tiny companion next to Prosody: website calls this to create XMPP accounts.
 * Bind only to localhost / private network; protect with PROSODY_PROVISION_TOKEN.
 *
 *   PROSODY_PROVISION_TOKEN=… node scripts/provision-api.mjs
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";

const PORT = Number(process.env.PROVISION_PORT || 8787);
const TOKEN = process.env.PROSODY_PROVISION_TOKEN || "";
const DOMAIN = process.env.NEXUS_XMPP_DOMAIN || "tri-cass.network";
const CONTAINER = process.env.PROSODY_CONTAINER || "tricass-prosody";

if (!TOKEN || TOKEN.length < 16) {
  console.error("Set a strong PROSODY_PROVISION_TOKEN (16+ chars).");
  process.exit(1);
}

function dockerAddUser(username, password) {
  return new Promise((resolve) => {
    const jid = `${username}@${DOMAIN}`;
    const child = spawn(
      "docker",
      ["exec", "-i", CONTAINER, "prosodyctl", "adduser", jid],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    let err = "";
    child.stderr.on("data", (d) => {
      err += d.toString();
    });
    child.on("close", (code) => {
      if (code === 0) return resolve({ ok: true });
      // Already exists → set password
      const pass = spawn(
        "docker",
        ["exec", "-i", CONTAINER, "prosodyctl", "passwd", jid],
        { stdio: ["pipe", "pipe", "pipe"] },
      );
      let err2 = "";
      pass.stderr.on("data", (d) => {
        err2 += d.toString();
      });
      pass.on("close", (code2) => {
        resolve(code2 === 0 ? { ok: true } : { ok: false, error: err || err2 || "failed" });
      });
      pass.stdin.write(`${password}\n${password}\n`);
      pass.stdin.end();
    });
    child.stdin.write(`${password}\n${password}\n`);
    child.stdin.end();
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "tricass-prosody-provision" }));
    return;
  }
  if (req.method !== "POST" || req.url !== "/provision") {
    res.writeHead(404);
    res.end();
    return;
  }
  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${TOKEN}`) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: "unauthorized" }));
    return;
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "bad json" }));
    return;
  }
  const username = String(data.username || "")
    .trim()
    .toLowerCase();
  const password = String(data.password || "");
  if (!/^[a-z][a-z0-9_]{2,23}$/.test(username) || password.length < 10) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "invalid username or password" }));
    return;
  }
  const result = await dockerAddUser(username, password);
  res.writeHead(result.ok ? 200 : 500, { "content-type": "application/json" });
  res.end(JSON.stringify(result));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`provision-api on 127.0.0.1:${PORT}`);
});
