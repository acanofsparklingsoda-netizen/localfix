"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { assetPath } from "@/lib/paths";

export function LoginForm() {
  const router = useRouter();
  const { ready: authReady, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextPath, setNextPath] = useState("");
  const [nextReady, setNextReady] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind?: "ok" | "err" }>({ text: "" });
  const [busy, setBusy] = useState(false);

  function readSafeNext() {
    const raw = new URLSearchParams(window.location.search).get("next") || "";
    return raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
  }

  function routeAfterLogin(overrideNext = nextPath) {
    router.push(overrideNext || "/");
  }

  async function withTimeout<T>(promise: Promise<T>, message: string, ms = 15000): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  useEffect(() => {
    const next = readSafeNext();
    setNextPath(next);
    setNextReady(true);
    if (!supabaseConfigured) {
      setMessage({ text: "Sign-in is not configured yet (missing Supabase keys).", kind: "err" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supabaseConfigured || !nextReady || !authReady || !user) return;
    routeAfterLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, nextReady, user]);

  async function login() {
    if (!email.trim() || !password) {
      setMessage({ text: "Enter your email and password.", kind: "err" });
      return;
    }
    setBusy(true);
    setMessage({ text: "Signing in..." });
    try {
      const res = await withTimeout(
        getSupabase().auth.signInWithPassword({ email: email.trim(), password }),
        "Sign-in is taking too long. Check your Supabase Auth settings and try again.",
      );
      if (res.error) {
        setMessage({ text: res.error.message, kind: "err" });
        return;
      }
      setMessage({ text: "Welcome back - taking you in...", kind: "ok" });
      if (res.data.session) routeAfterLogin();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Could not sign in. Please try again.", kind: "err" });
    } finally {
      setBusy(false);
    }
  }

  function onPasswordKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") login();
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="auth-badge">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath("/favicon.png")} alt="" />
        </div>
        <h1>Welcome back</h1>
        <p className="sub">Log in to post a repair, check messages, or manage worker leads.</p>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={onPasswordKey} />
        </div>
        <button className="btn btn-primary btn-lg auth-submit" type="button" disabled={busy || !supabaseConfigured} onClick={login}>
          Log in
        </button>
        <p className={`auth-msg${message.kind ? ` ${message.kind}` : ""}`} role="status" aria-live="polite">
          {message.text}
        </p>

        <p className="auth-hint">
          Posting a repair now requires an account so replies and chats stay connected.
        </p>
        <div className="auth-switch">
          New to Local Fix? <Link href={`/signup${nextPath ? `?type=homeowner&next=${encodeURIComponent(nextPath)}` : ""}`}>Create an account</Link>
        </div>
      </div>
    </main>
  );
}
