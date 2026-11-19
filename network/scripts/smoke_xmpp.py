#!/usr/bin/env python3
"""Lab smoke: two accounts log in, exchange a PM, join #general MUC."""

from __future__ import annotations

import asyncio
import os
import ssl
import sys
import uuid

try:
    import slixmpp
except ImportError:
    print(
        "Install slixmpp first: python3 -m pip install --user slixmpp",
        file=sys.stderr,
    )
    sys.exit(2)


DOMAIN = os.environ.get("NEXUS_XMPP_DOMAIN", "nexus.network")
HOST = os.environ.get("NEXUS_XMPP_HOST", "127.0.0.1")
PORT = int(os.environ.get("NEXUS_XMPP_PORT", "5222"))
ALICE_PASS = os.environ.get("NEXUS_ALICE_PASSWORD", "")
BOB_PASS = os.environ.get("NEXUS_BOB_PASSWORD", "")
ROOM = f"general@conference.{DOMAIN}"
TOKEN = uuid.uuid4().hex[:8]


class Bot(slixmpp.ClientXMPP):
    def __init__(self, jid: str, password: str, nick: str):
        super().__init__(jid, password)
        self.nick = nick
        self.ready = asyncio.Event()
        self.got_pm = asyncio.Event()
        self.got_muc = asyncio.Event()
        self.add_event_handler("session_start", self._start)
        self.add_event_handler("message", self._message)
        self.add_event_handler("groupchat_message", self._muc)
        self.add_event_handler("failed_auth", self._fail_auth)

    def _fail_auth(self, event):
        print(f"AUTH FAIL {self.boundjid or self.requested_jid}: {event}", file=sys.stderr)

    async def _start(self, _event):
        self.send_presence()
        await self.get_roster()
        try:
            await self.plugin["xep_0045"].join_muc_wait(ROOM, self.nick, timeout=15)
        except Exception as err:
            print(f"{self.nick}: muc join warning: {err}", file=sys.stderr)
            self.plugin["xep_0045"].join_muc(ROOM, self.nick)
            await asyncio.sleep(2)
        self.ready.set()

    def _message(self, msg):
        if msg["type"] in ("chat", "normal") and TOKEN in (msg["body"] or ""):
            self.got_pm.set()

    def _muc(self, msg):
        if msg["mucnick"] != self.nick and TOKEN in (msg["body"] or ""):
            self.got_muc.set()


async def main() -> int:
    if not ALICE_PASS or not BOB_PASS:
        print("Set NEXUS_ALICE_PASSWORD and NEXUS_BOB_PASSWORD", file=sys.stderr)
        return 2

    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    alice = Bot(f"alice@{DOMAIN}", ALICE_PASS, "alice")
    bob = Bot(f"bob@{DOMAIN}", BOB_PASS, "bob")
    for bot in (alice, bob):
        bot.register_plugin("xep_0030")
        bot.register_plugin("xep_0045")
        bot.register_plugin("xep_0199")
        bot.ssl_context = ssl_ctx
        bot.connect((HOST, PORT))

    try:
        await asyncio.wait_for(
            asyncio.gather(alice.ready.wait(), bob.ready.wait()),
            timeout=20,
        )
    except asyncio.TimeoutError:
        print("FAIL: session_start timeout", file=sys.stderr)
        alice.disconnect()
        bob.disconnect()
        return 1

    await asyncio.sleep(1.0)
    bob.send_message(mto=f"alice@{DOMAIN}", mbody=f"pm-{TOKEN}", mtype="chat")
    await asyncio.sleep(0.5)
    alice.send_message(mto=ROOM, mbody=f"muc-{TOKEN}", mtype="groupchat")

    try:
        await asyncio.wait_for(alice.got_pm.wait(), timeout=15)
        await asyncio.wait_for(bob.got_muc.wait(), timeout=15)
    except asyncio.TimeoutError:
        print(
            f"FAIL: pm={alice.got_pm.is_set()} muc={bob.got_muc.is_set()}",
            file=sys.stderr,
        )
        alice.disconnect()
        bob.disconnect()
        return 1

    print(f"OK: PM + MUC #general on {DOMAIN} via {HOST}:{PORT}")
    alice.disconnect()
    bob.disconnect()
    await asyncio.sleep(0.5)
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
