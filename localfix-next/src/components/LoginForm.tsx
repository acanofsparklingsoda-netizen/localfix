"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { assetPath } from "@/lib/paths";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; kind?: "ok" | "err" }>({ text: "" });
  const [busy, setBusy] = useState(false);

  async function routeByRole(userId: string) {
    let dest = "/contractors";
    try {
      const prof = await getSupabase().from("profiles").select("role").eq("id", userId).maybeSingle();
      if (prof.data?.role === "admin") dest = "/admin";
    } catch {
      dest = "/contractors";
    }
    router.push(dest);
  }

  useEffect(() => {
    if (!supabaseConfigured) {
      setMessage({ text: "Sign-in is not configured yet (missing Supabase keys).", kind: "err" });
      return;
    }
    getSupabase().auth.getSession().then((result) => {
      const session = result.data.session;
      if (session) routeByRole(session.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login() {
    if (!email.trim() || !password) {
      setMessage({ text: "Enter your email and password.", kind: "err" });
      return;
    }
    setBusy(true);
    setMessage({ text: "Signing in..." });
    const res = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (res.error) {
      setMessage({ text: res.error.message, kind: "err" });
      return;
    }
    setMessage({ text: "Welcome back - taking you in...", kind: "ok" });
    if (res.data.session) await routeByRole(res.data.session.user.id);
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
        <p className="sub">Log in to your worker or admin account.</p>

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
          Homeowners do not need an account - just <Link href="/post-job">post your problem</Link>.
        </p>
        <div className="auth-switch">
          New to Local Fix? <Link href="/signup">Create a worker account</Link>
        </div>
      </div>
    </main>
  );
}
