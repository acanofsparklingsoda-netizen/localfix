"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeaderFallback, RoleAppHeader } from "./AccountChrome";
import { useAuth } from "./AuthProvider";
import { BodyClass } from "./BodyClass";
import { CalendarIcon, InboxIcon, WrenchIcon } from "./Icons";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

const STATUSES = ["Submitted", "Reviewing", "Sent to worker", "Worker interested", "Connected", "Completed", "Cancelled"];
const TABLE = "job_submissions";

type JobSubmission = {
  id: string | number;
  name?: string | null;
  status?: string | null;
  created_at?: string | null;
  category?: string | null;
  urgency?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  zip?: string | null;
  consent?: boolean | null;
  media?: unknown;
  referer?: string | null;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

function mediaItems(media: unknown): string[] {
  return Array.isArray(media) ? media.filter((item): item is string => typeof item === "string") : [];
}

function isMediaUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function isImage(url: string) {
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(url.split("?")[0]);
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url.split("?")[0]);
}

function urgClass(urgency?: string | null) {
  const text = (urgency || "").toLowerCase();
  if (text.includes("today")) return "lf-badge--today";
  if (text.includes("flex")) return "lf-badge--flex";
  return "lf-badge--week";
}

function statusClass(status?: string | null) {
  const text = (status || "").toLowerCase();
  if (text.includes("review")) return "lf-status--reviewing";
  if (text.includes("sent")) return "lf-status--sent";
  if (text.includes("interest")) return "lf-status--interested";
  if (text.includes("connect")) return "lf-status--connected";
  if (text.includes("complet")) return "lf-status--completed";
  if (text.includes("cancel")) return "lf-status--cancelled";
  return "lf-status--submitted";
}

function MediaNode({ url }: { url: string }) {
  if (!isMediaUrl(url)) return <span className="lf-nomedia">{url}</span>;
  if (isImage(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} loading="lazy" alt="submission photo" />
      </a>
    );
  }
  if (isVideo(url)) return <video src={url} controls preload="metadata" />;
  return (
    <a className="lf-media-file" href={url} target="_blank" rel="noopener noreferrer">
      {url.split("/").pop() || "Open file"}
    </a>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="lf-field-label">{label}</span>
      <div className="lf-field-value">{children}</div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="lf-block">
      <div className="lf-block-label">{label}</div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="lf-empty">
      <div className="lf-mark">
        <InboxIcon />
      </div>
      <h3>No submissions yet</h3>
      <p>New job posts from homeowners will show up here.</p>
    </div>
  );
}

function SubmissionCard({ row, onStatusChange }: { row: JobSubmission; onStatusChange: (id: string | number, next: string) => Promise<boolean> }) {
  const [status, setStatus] = useState(row.status || "Submitted");
  const [note, setNote] = useState<{ text: string; ok?: boolean }>({ text: "" });
  const media = mediaItems(row.media);

  async function changeStatus(next: string) {
    const prev = status;
    setStatus(next);
    setNote({ text: "Saving..." });
    const ok = await onStatusChange(row.id, next);
    if (!ok) {
      setStatus(prev);
      setNote({ text: "Could not save", ok: false });
      return;
    }
    setNote({ text: "Saved", ok: true });
    setTimeout(() => setNote({ text: "" }), 1500);
  }

  return (
    <div className="lf-card">
      <div className="lf-card-head">
        <h2 className="lf-card-title">{row.name || "(no name)"}</h2>
        <div className="lf-card-head-right">
          {status ? <span className={`lf-status ${statusClass(status)}`}>{status}</span> : null}
          <span className="lf-card-date">{fmtDate(row.created_at)}</span>
        </div>
      </div>

      <div className="lf-badges">
        {row.category ? (
          <span className="lf-badge lf-badge--cat">
            <WrenchIcon /> <span>{row.category}</span>
          </span>
        ) : null}
        {row.urgency ? (
          <span className={`lf-badge ${urgClass(row.urgency)}`}>
            <CalendarIcon /> <span>{row.urgency}</span>
          </span>
        ) : null}
      </div>

      <div className="lf-rule" />

      <Block label="Problem">
        <p className="lf-desc">{row.description || "—"}</p>
      </Block>

      <Block label="Contact">
        <div className="lf-fields">
          <Field label="Phone">{row.phone ? <a href={`tel:${row.phone}`}>{row.phone}</a> : "—"}</Field>
          <Field label="Email">{row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : "—"}</Field>
          <Field label="ZIP code">{row.zip || "—"}</Field>
          <Field label="Consent to contact">{row.consent ? "Yes" : "No"}</Field>
        </div>
      </Block>

      <Block label="Photos & video">
        {media.length ? (
          <div className="lf-media">
            {media.map((url) => (
              <MediaNode key={url} url={url} />
            ))}
          </div>
        ) : (
          <div className="lf-nomedia">No photos or videos attached.</div>
        )}
      </Block>

      <div className="lf-statusedit">
        <span className="lf-statusedit-label">Status</span>
        <select value={status} onChange={(event) => changeStatus(event.target.value)}>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span className={`lf-statusedit-note${note.ok === true ? " is-ok" : note.ok === false ? " is-err" : ""}`}>{note.text}</span>
      </div>

      {row.referer ? <div className="lf-foot">Source: {row.referer}</div> : null}
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const { ready: authReady, profileReady, user } = useAuth();
  const loadedFor = useRef("");
  const [rows, setRows] = useState<JobSubmission[]>([]);
  const [status, setStatus] = useState<{ text: string; err?: boolean }>({ text: "Loading..." });
  const [loading, setLoading] = useState(true);

  async function loadJobs() {
    if (!supabaseConfigured) {
      setStatus({ text: "Supabase is not configured (missing keys).", err: true });
      setLoading(false);
      return;
    }
    setStatus({ text: "Loading submissions..." });
    const res = await getSupabase().from(TABLE).select("*").order("created_at", { ascending: false });
    if (res.error) {
      setStatus({ text: `Error: ${res.error.message}`, err: true });
      setLoading(false);
      return;
    }
    setRows((res.data || []) as JobSubmission[]);
    setStatus({ text: "" });
    setLoading(false);
  }

  useEffect(() => {
    if (!supabaseConfigured) {
      setStatus({ text: "Supabase is not configured (missing keys).", err: true });
      setLoading(false);
      return;
    }
    if (!authReady || !profileReady) {
      setStatus({ text: "Loading..." });
      setLoading(true);
      return;
    }
    if (!user) {
      router.push("/login?next=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.push(user.role === "contractor" ? "/contractors" : "/post-job");
      return;
    }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, profileReady, router, user?.id, user?.role]);

  async function onStatusChange(id: string | number, next: string) {
    const res = await getSupabase().from(TABLE).update({ status: next }).eq("id", id);
    if (!res.error) {
      setRows((current) => current.map((row) => (row.id === id ? { ...row, status: next } : row)));
    }
    return !res.error;
  }

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/");
  }

  return (
    <>
      <BodyClass className="lf-app" />
      {user?.role === "admin" ? <RoleAppHeader user={user} activeHref="/admin" onLogout={logout} /> : <AppHeaderFallback activeHref="/admin" />}
      <main className="lf-main">
        <div className="lf-head">
          <div>
            <h1>Job submissions</h1>
            <p className="lf-sub">{rows.length ? `${rows.length} ${rows.length === 1 ? "submission" : "submissions"}` : ""}</p>
          </div>
          <div className="lf-actions">
            <button className="lf-btn" type="button" onClick={loadJobs} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {status.text ? <p className={`lf-msg${status.err ? " is-err" : ""}`}>{status.text}</p> : null}
        <div className="lf-feed">{!loading && rows.length === 0 && !status.err ? <EmptyState /> : rows.map((row) => <SubmissionCard key={row.id} row={row} onStatusChange={onStatusChange} />)}</div>
      </main>
    </>
  );
}
