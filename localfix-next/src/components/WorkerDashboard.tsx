"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppHeaderFallback, RoleAppHeader } from "./AccountChrome";
import { type AuthUser, useAuth } from "./AuthProvider";
import { BodyClass } from "./BodyClass";
import { BriefcaseIcon, CalendarIcon, ChartIcon, DollarIcon, MessageIcon, WrenchIcon } from "./Icons";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

type Lead = {
  id: string | number;
  created_at?: string | null;
  category?: string | null;
  urgency?: string | null;
  zip?: string | null;
  description?: string | null;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function DashboardStat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <article className="lf-dash-stat">
      <span className="lf-dash-stat-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{note}</span>
      </div>
    </article>
  );
}

export function WorkerDashboard() {
  const router = useRouter();
  const { ready: authReady, profileReady, user } = useAuth();
  const loadedFor = useRef("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState("Loading dashboard...");
  const [err, setErr] = useState(false);

  async function loadDashboard(sessionUser: AuthUser) {
    const sb = getSupabase();
    const role = sessionUser.role;
    if (role === "homeowner") {
      router.push("/post-job");
      return;
    }

    if (role === "contractor" && sessionUser.approved === false) {
      setErr(false);
      setStatus("Your account is pending approval. Dashboard data will appear once an admin approves you.");
      return;
    }

    const res = await sb.rpc("list_jobs_for_contractor");
    if (res.error) {
      setErr(true);
      setStatus(`Could not load leads: ${res.error.message}`);
      return;
    }
    setLeads(((res.data || []) as Lead[]).slice(0, 5));
    setStatus("");
  }

  useEffect(() => {
    if (!supabaseConfigured) {
      setErr(true);
      setStatus("Sign-in is not configured yet.");
      return;
    }
    if (!authReady || !profileReady) {
      setErr(false);
      setStatus("Loading dashboard...");
      return;
    }
    if (!user) {
      router.push("/login?next=/contractors/dashboard");
      return;
    }
    if (user.role === "homeowner") {
      router.push("/post-job");
      return;
    }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    loadDashboard(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, profileReady, router, user?.id, user?.role, user?.approved]);

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/");
  }

  return (
    <>
      <BodyClass className="lf-app" />
      {user && user.role !== "homeowner" ? <RoleAppHeader user={user} activeHref="/contractors/dashboard" onLogout={logout} /> : <AppHeaderFallback activeHref="/contractors/dashboard" />}
      <main className="lf-main">
        <div className="lf-head">
          <div>
            <h1>Worker dashboard</h1>
            <p className="lf-sub">A simple view of leads, revenue, and follow-up work.</p>
          </div>
          <div className="lf-actions">
            <Link className="lf-btn lf-btn--primary" href="/contractors">
              Browse jobs
            </Link>
          </div>
        </div>

        {status ? <p className={`lf-msg${err ? " is-err" : ""}`}>{status}</p> : null}

        <section className="lf-dash-grid" aria-label="Worker numbers">
          <DashboardStat icon={<DollarIcon />} label="Total revenue" value="$0" note="Payment tracking is not connected yet" />
          <DashboardStat icon={<BriefcaseIcon />} label="Active leads" value={String(leads.length)} note="Available jobs in your feed" />
          <DashboardStat icon={<ChartIcon />} label="Leads pursued" value="0" note="Interest tracking comes next" />
          <DashboardStat icon={<MessageIcon />} label="Unread chats" value="0" note="Frontend chat is ready" />
        </section>

        <section className="lf-dash-panels">
          <article className="lf-dash-panel">
            <div className="lf-dash-panel-head">
              <h2>Recent leads</h2>
              <Link href="/contractors">View all</Link>
            </div>
            <div className="lf-lead-list">
              {leads.length ? (
                leads.map((lead) => (
                  <div className="lf-lead-row" key={lead.id}>
                    <span className="lf-lead-icon">
                      <WrenchIcon />
                    </span>
                    <div>
                      <strong>{lead.category || "Repair job"}</strong>
                      <p>{lead.description || "No description provided."}</p>
                      <span>
                        {lead.zip ? `ZIP ${lead.zip}` : "Area not listed"} {lead.urgency ? `· ${lead.urgency}` : ""} {lead.created_at ? `· ${fmtDate(lead.created_at)}` : ""}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="lf-empty">
                  <div className="lf-mark">
                    <CalendarIcon />
                  </div>
                  <h3>No leads yet</h3>
                  <p>New repair jobs will show here after homeowners post them.</p>
                </div>
              )}
            </div>
          </article>

          <article className="lf-dash-panel">
            <div className="lf-dash-panel-head">
              <h2>Follow-up</h2>
              <Link href="/chats">Open chats</Link>
            </div>
            <div className="lf-follow-list">
              <div>
                <strong>Set up lead pursuit tracking</strong>
                <span>Needed before “active leads being pursued” can become live data.</span>
              </div>
              <div>
                <strong>Connect revenue source</strong>
                <span>Needed before the revenue card can pull from real payments or job completions.</span>
              </div>
              <div>
                <strong>Chat backend later</strong>
                <span>The chat layout is frontend-only for now.</span>
              </div>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
