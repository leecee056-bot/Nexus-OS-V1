/**
 * Optional Prosody account provisioning.
 * When PROSODY_PROVISION_URL + PROSODY_PROVISION_TOKEN are unset (default),
 * website signup only reserves the identity in Postgres — Network chat is not live yet.
 * When set (VPS companion), signup notifies the provisioner with username only —
 * the website account password is never sent.
 */

export type ProsodyProvisionResult =
  | { ok: true; provisioned: boolean }
  | { ok: false; error: string };

export async function provisionProsodyAccount(input: {
  username: string;
}): Promise<ProsodyProvisionResult> {
  const url = process.env.PROSODY_PROVISION_URL?.trim();
  const token = process.env.PROSODY_PROVISION_TOKEN?.trim();
  if (!url || !token) {
    return { ok: true, provisioned: false };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: input.username,
        domain: process.env.NEXUS_XMPP_DOMAIN?.trim() || "tri-cass.network",
        // Intentionally no password — site credentials never leave this app.
        reserveOnly: true,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("prosody provision failed", res.status, text.slice(0, 200));
      return { ok: false, error: "Could not create Network chat account yet." };
    }
    return { ok: true, provisioned: true };
  } catch (err) {
    console.error(
      "prosody provision error",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "Network chat server unreachable." };
  }
}
