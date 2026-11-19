"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "signup" | "signin";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setPending(true);
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/signin";
      const body =
        mode === "signup"
          ? { username, email, password }
          : { login: username || email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        sampleDb?: boolean;
      };
      if (!res.ok) {
        setError(data.error || "Request failed.");
        return;
      }
      setOk(
        data.message ||
          (mode === "signup"
            ? "Account reserved. Network servers coming."
            : "Signed in."),
      );
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {mode === "signup" ? (
        <>
          <label>
            Username
            <input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
              minLength={3}
              maxLength={24}
              pattern="[a-z][a-z0-9_]{2,23}"
            />
            <span className="hint">
              Becomes @username@nexus.network when Network launches
            </span>
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </>
      ) : (
        <label>
          Username or email
          <input
            name="login"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
      )}
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={10}
        />
        {mode === "signup" ? (
          <span className="hint">At least 10 characters. Stored hashed.</span>
        ) : null}
      </label>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {ok ? <div className="alert">{ok}</div> : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending
          ? "Working…"
          : mode === "signup"
            ? "Create Network account"
            : "Sign in"}
      </button>
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button className="btn btn-ghost" type="button" onClick={signOut} disabled={pending}>
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
