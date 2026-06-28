"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { AccountMenu, AccountUser, GuestAccountMenu } from "./AccountChrome";

function GuestAuthNav() {
  return (
    <>
      <Link className="nav-btn nav-login" href="/login">
        Log in
      </Link>
      <GuestAccountMenu />
    </>
  );
}

export function AuthNav() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }

    const sb = getSupabase();

    async function resolveUser(sessionUser: { id: string; email?: string } | null | undefined) {
      if (!sessionUser) {
        setUser(null);
        setReady(true);
        return;
      }
      let role = "contractor";
      try {
        const prof = await sb.from("profiles").select("role").eq("id", sessionUser.id).maybeSingle();
        if (prof.data?.role) role = String(prof.data.role);
      } catch {
        role = "contractor";
      }
      setUser({ email: sessionUser.email || "", role });
      setReady(true);
    }

    sb.auth.getSession().then((result) => resolveUser(result.data.session?.user));
    const { data } = sb.auth.onAuthStateChange((_event, session) => resolveUser(session?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured || !ready) return <GuestAuthNav />;

  if (!user) {
    return <GuestAuthNav />;
  }

  return (
    <AccountMenu
      user={user}
      onLogout={async () => {
        await getSupabase().auth.signOut();
        window.location.reload();
      }}
    />
  );
}
