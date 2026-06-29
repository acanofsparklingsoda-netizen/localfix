"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { AccountMenu, GuestAccountMenu } from "./AccountChrome";

function GuestAuthNav() {
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <>
      <Link className="nav-btn nav-login" href={loginHref}>
        Log in
      </Link>
      <GuestAccountMenu />
    </>
  );
}

function LoadingAuthNav() {
  return (
    <span className="nav-auth-loading" aria-hidden="true">
      <span className="nav-auth-loading-pill" />
    </span>
  );
}

export function AuthNav() {
  const router = useRouter();
  const { ready, user } = useAuth();

  if (!supabaseConfigured) return <GuestAuthNav />;
  if (!ready) return <LoadingAuthNav />;

  if (!user) {
    return <GuestAuthNav />;
  }

  return (
    <AccountMenu
      user={user}
      onLogout={async () => {
        await getSupabase().auth.signOut();
        router.push("/");
      }}
    />
  );
}
