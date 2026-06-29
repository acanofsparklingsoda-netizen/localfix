"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  approved?: boolean | null;
};

type AuthContextValue = {
  ready: boolean;
  profileReady: boolean;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue>({ ready: false, profileReady: false, user: null });

function baseUser(sessionUser: User): AuthUser {
  return {
    id: sessionUser.id,
    email: sessionUser.email || "",
    role: "homeowner",
    approved: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!supabaseConfigured);
  const [profileReady, setProfileReady] = useState(!supabaseConfigured);
  const [user, setUser] = useState<AuthUser | null>(null);
  const loadId = useRef(0);

  useEffect(() => {
    if (!supabaseConfigured) return;

    const sb = getSupabase();
    let alive = true;

    function setSessionUser(sessionUser: User | null | undefined) {
      loadId.current += 1;
      const currentLoad = loadId.current;

      if (!sessionUser) {
        setUser(null);
        setReady(true);
        setProfileReady(true);
        return;
      }

      const nextUser = baseUser(sessionUser);
      setUser(nextUser);
      setReady(true);
      setProfileReady(false);

      window.setTimeout(async () => {
        try {
          const prof = await sb
            .from("profiles")
            .select("role, approved")
            .eq("id", sessionUser.id)
            .maybeSingle();
          if (!alive || currentLoad !== loadId.current) return;
          setUser({
            ...nextUser,
            role: prof.data?.role ? String(prof.data.role) : nextUser.role,
            approved: typeof prof.data?.approved === "boolean" ? prof.data.approved : null,
          });
          setProfileReady(true);
        } catch {
          if (!alive || currentLoad !== loadId.current) return;
          setUser(nextUser);
          setProfileReady(true);
        }
      }, 0);
    }

    sb.auth.getSession().then((result) => {
      if (!alive) return;
      setSessionUser(result.data.session?.user);
    });

    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user);
    });

    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ ready, profileReady, user }), [ready, profileReady, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
