"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { assetPath } from "@/lib/paths";

export function SignupForm() {
  const router = useRouter();
  const { ready: authReady, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"homeowner" | "contractor">("homeowner");
  const [nextPath, setNextPath] = useState("");
  const [nextReady, setNextReady] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind?: "ok" | "err" }>({ text: "" });
  const [busy, setBusy] = useState(false);

  function readSafeNext() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("next") || "";
    const type = params.get("type");
    if (type === "contractor" || type === "worker") setAccountType("contractor");
    if (type === "homeowner") setAccountType("homeowner");
    return raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
  }

  useEffect(() => {
    const next = readSafeNext();
    setNextPath(next);
    setNextReady(true);
    if (!supabaseConfigured) {
      setMessage({ text: "Sign-up is not configured yet (missing Supabase keys).", kind: "err" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supabaseConfigured || !nextReady || !authReady || !user) return;
    router.push(nextPath || "/post-job");
  }, [authReady, nextPath, nextReady, router, user]);

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
    const res = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { role: accountType, account_type: accountType } },
    });
    setBusy(false);
    if (res.error) {
      setMessage({ text: res.error.message, kind: "err" });
      return;
    }
    if (res.data.session) {
      setMessage({ text: "You are in - taking you to the next step...", kind: "ok" });
      router.push(nextPath || (accountType === "contractor" ? "/contractors" : "/post-job"));
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
        <p className="sub">Choose the account that fits what you need today.</p>

        <div className="auth-choice" aria-label="Account type">
          <button className={accountType === "homeowner" ? "is-active" : undefined} type="button" onClick={() => setAccountType("homeowner")}>
            I need a repair
          </button>
          <button className={accountType === "contractor" ? "is-active" : undefined} type="button" onClick={() => setAccountType("contractor")}>
            I am a worker
          </button>
        </div>

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
          {accountType === "homeowner" ? "After signup, you can upload your repair problem." : "Worker accounts can browse jobs after approval if approvals are enabled."}
        </p>
        <div className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
}
