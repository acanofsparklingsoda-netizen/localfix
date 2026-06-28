"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { assetPath } from "@/lib/paths";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; kind?: "ok" | "err" }>({ text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      setMessage({ text: "Sign-up is not configured yet (missing Supabase keys).", kind: "err" });
      return;
    }
    getSupabase().auth.getSession().then((result) => {
      if (result.data.session) router.push("/contractors");
    });
  }, [router]);

  async function signup() {
    if (!email.trim() || !password) {
      setMessage({ text: "Enter your email and a password.", kind: "err" });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", kind: "err" });
      return;
    }
    setBusy(true);
    setMessage({ text: "Creating your account..." });
    const res = await getSupabase().auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (res.error) {
      setMessage({ text: res.error.message, kind: "err" });
      return;
    }
    if (res.data.session) {
      setMessage({ text: "You are in - taking you to the jobs board...", kind: "ok" });
      router.push("/contractors");
    } else {
      setMessage({ text: "Account created! Check your email to confirm, then log in.", kind: "ok" });
    }
  }

  function onPasswordKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") signup();
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="auth-badge">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath("/favicon.png")} alt="" />
        </div>
        <h1>Create your account</h1>
        <p className="sub">For local workers who want to pick up jobs.</p>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={onPasswordKey} />
        </div>
        <button className="btn btn-primary btn-lg auth-submit" type="button" disabled={busy || !supabaseConfigured} onClick={signup}>
          Create account
        </button>
        <p className={`auth-msg${message.kind ? ` ${message.kind}` : ""}`} role="status" aria-live="polite">
          {message.text}
        </p>

        <p className="auth-hint">
          Just need a repair done? You do not need an account - <Link href="/post-job">post your problem</Link>.
        </p>
        <div className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
}
