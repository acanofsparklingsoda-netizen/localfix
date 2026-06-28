"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { KeyboardEvent, useEffect, useState } from "react";

const SUPABASE_URL = "https://fhqesrtkjbpwkasyadzs.supabase.co";
const KEY_STORE = "lf_admin_service_key";

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

function isImage(url: string) {
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(url.split("?")[0]);
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url.split("?")[0]);
}

function urgClass(urgency?: string | null) {
  const text = (urgency || "").toLowerCase();
  if (text.includes("today")) return "urg-today";
  if (text.includes("flex")) return "urg-flex";
  return "urg-week";
}

function statusClass(status?: string | null) {
  const text = (status || "").toLowerCase();
  if (text.includes("review")) return "s-reviewing";
  if (text.includes("sent")) return "s-sent";
  if (text.includes("interest")) return "s-interested";
  if (text.includes("connect")) return "s-connected";
  if (text.includes("complet")) return "s-completed";
  if (text.includes("cancel")) return "s-cancelled";
  return "s-submitted";
}

function MediaNode({ url }: { url: string }) {
  if (!/^https?:\/\//i.test(url)) return <span className="sk-no-media">{url}</span>;
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
    <a className="sk-file" href={url} target="_blank" rel="noopener noreferrer">
      {url.split("/").pop() || "Open file"}
    </a>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sk-field">
      <span className="sk-field-label">{label}</span>
      <div className="sk-field-value">{children}</div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sk-section">
      <div className="sk-section-label">{label}</div>
      {children}
    </div>
  );
}

function SubmissionCard({ row }: { row: JobSubmission }) {
  const media = mediaItems(row.media);

  return (
    <div className="sk-card">
      <div className="sk-card-head">
        <h2>{row.name || "(no name)"}</h2>
        <div className="sk-head-right">
          {row.status ? <span className={`sk-status-chip ${statusClass(row.status)}`}>{row.status}</span> : null}
          <span className="sk-date">{fmtDate(row.created_at)}</span>
        </div>
      </div>

      <div className="sk-badges">
        {row.category ? <span className="sk-badge cat">{row.category}</span> : null}
        {row.urgency ? <span className={`sk-badge ${urgClass(row.urgency)}`}>{row.urgency}</span> : null}
      </div>

      <div className="sk-divider" />

      <Section label="Problem">
        <p className="sk-desc">{row.description || "-"}</p>
      </Section>
      <Section label="Contact">
        <div className="sk-fields">
          <Field label="Phone">{row.phone ? <a href={`tel:${row.phone}`}>{row.phone}</a> : "-"}</Field>
          <Field label="Email">{row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : "-"}</Field>
          <Field label="ZIP code">{row.zip || "-"}</Field>
          <Field label="Consent to contact">{row.consent ? "Yes" : "No"}</Field>
        </div>
      </Section>
      <Section label="Photos & video">
        {media.length ? (
          <div className="sk-media">
            {media.map((url) => (
              <MediaNode key={url} url={url} />
            ))}
          </div>
        ) : (
          <div className="sk-no-media">No photos or videos attached.</div>
        )}
      </Section>
      {row.referer ? <div className="sk-foot">Source: {row.referer}</div> : null}
    </div>
  );
}

export function AdminServiceKeyPage() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [key, setKey] = useState("");
  const [remember, setRemember] = useState(true);
  const [gateMessage, setGateMessage] = useState("");
  const [status, setStatus] = useState<{ text: string; err?: boolean }>({ text: "" });
  const [rows, setRows] = useState<JobSubmission[]>([]);

  async function loadWith(nextClient: SupabaseClient) {
    setStatus({ text: "Loading submissions..." });
    setRows([]);
    const res = await nextClient.from("job_submissions").select("*").order("created_at", { ascending: false });
    if (res.error) {
      const message = res.error.message || "Failed to load.";
      if (/jwt|api key|unauthorized|invalid/i.test(message)) {
        setClient(null);
        setGateMessage(`That key did not work (${message}). Make sure it is the service_role key.`);
      } else {
        setStatus({ text: `Error: ${message}`, err: true });
      }
      return;
    }
    const nextRows = (res.data || []) as JobSubmission[];
    setRows(nextRows);
    setStatus({ text: nextRows.length ? "" : "No submissions yet." });
  }

  function start(nextKey: string) {
    try {
      const nextClient = createClient(SUPABASE_URL, nextKey);
      setClient(nextClient);
      setGateMessage("");
      loadWith(nextClient);
    } catch (err) {
      setGateMessage(`Could not start: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(KEY_STORE) || "";
    if (saved) start(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function load() {
    const clean = key.trim();
    if (!clean) {
      setGateMessage("Paste your service_role key first.");
      return;
    }
    if (remember) localStorage.setItem(KEY_STORE, clean);
    start(clean);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") load();
  }

  function forget() {
    localStorage.removeItem(KEY_STORE);
    setClient(null);
    setKey("");
    setRows([]);
    setStatus({ text: "" });
    setGateMessage("Key forgotten. Paste it again to reload.");
  }

  return (
    <>
      <style jsx global>{`
        .sk-page {
          margin: 0;
          color: var(--ink);
          background: var(--paper);
          min-height: 100vh;
        }
        .sk-wrap {
          width: min(960px, calc(100% - 32px));
          margin: 0 auto;
        }
        .sk-bar {
          position: sticky;
          top: 0;
          z-index: 5;
          background: rgba(251, 250, 247, 0.92);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid var(--line);
        }
        .sk-bar-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 0;
        }
        .sk-bar h1 {
          font-size: 1.1rem;
          margin: 0;
        }
        .sk-count {
          color: var(--muted);
          font-size: 0.9rem;
        }
        .sk-spacer {
          flex: 1;
        }
        .sk-btn {
          border: 1px solid var(--line);
          background: #fff;
          color: var(--ink);
          padding: 8px 14px;
          border-radius: 9px;
          font-weight: 600;
          cursor: pointer;
        }
        .sk-btn:hover {
          border-color: var(--green);
        }
        .sk-btn-primary {
          background: var(--green);
          border-color: var(--green);
          color: #fff;
        }
        .sk-warn {
          background: #fcf3e6;
          border: 1px solid var(--gold);
          color: #7a5a17;
          padding: 12px 16px;
          border-radius: 10px;
          margin: 18px 0;
          font-size: 0.9rem;
        }
        .sk-gate {
          max-width: 520px;
          margin: 60px auto;
          text-align: center;
        }
        .sk-card-box {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 32px;
          box-shadow: var(--shadow-sm);
          text-align: left;
        }
        .sk-card-box h2 {
          margin-top: 0;
        }
        .sk-card-box label {
          display: block;
          font-weight: 600;
          margin: 16px 0 6px;
        }
        .sk-card-box input[type="password"] {
          width: 100%;
          padding: 11px 13px;
          border: 1px solid var(--line);
          border-radius: 9px;
          font: inherit;
        }
        .sk-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 14px 0 20px;
          font-size: 0.9rem;
          color: var(--muted);
        }
        .sk-status {
          color: var(--muted);
          padding: 24px 0;
        }
        .sk-status.err {
          color: var(--clay);
          font-weight: 600;
        }
        .sk-list {
          display: grid;
          gap: 18px;
          padding: 24px 0 60px;
        }
        .sk-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 20px 22px;
          box-shadow: var(--shadow-sm);
        }
        .sk-card-head {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .sk-card-head h2 {
          margin: 0;
          font-size: 1.15rem;
        }
        .sk-head-right {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }
        .sk-date {
          color: var(--muted);
          font-size: 0.85rem;
        }
        .sk-status-chip {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: var(--mist);
          color: var(--green-dark);
          white-space: nowrap;
        }
        .sk-status-chip.s-reviewing {
          background: #fcf3e6;
          color: #8a6516;
          border-color: #ecd9b3;
        }
        .sk-status-chip.s-sent,
        .sk-status-chip.s-interested {
          background: #e9f0f6;
          color: #2f5a78;
          border-color: #cfe0ec;
        }
        .sk-status-chip.s-connected {
          background: #eaf5ec;
          color: var(--green-dark);
          border-color: #cce6d2;
        }
        .sk-status-chip.s-completed {
          background: var(--green-dark);
          color: #fff;
          border-color: var(--green-dark);
        }
        .sk-status-chip.s-cancelled {
          background: #f5ecea;
          color: var(--clay);
          border-color: #e8d2cc;
        }
        .sk-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin: 14px 0 0;
        }
        .sk-badge {
          font-size: 0.92rem;
          font-weight: 800;
          padding: 8px 18px;
          border-radius: 999px;
          letter-spacing: 0.01em;
          color: #fff;
        }
        .sk-badge.cat {
          background: var(--green-dark);
        }
        .sk-badge.urg-today {
          background: var(--clay);
        }
        .sk-badge.urg-week {
          background: var(--gold);
          color: #4a370c;
        }
        .sk-badge.urg-flex {
          background: var(--blue);
        }
        .sk-divider {
          height: 1px;
          background: var(--line);
          margin: 18px 0;
        }
        .sk-section {
          margin-bottom: 18px;
        }
        .sk-section-label {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 8px;
        }
        .sk-desc {
          margin: 0;
          white-space: pre-wrap;
          font-size: 1rem;
        }
        .sk-fields {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 36px;
        }
        .sk-field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 2px;
        }
        .sk-field-value {
          font-weight: 600;
        }
        .sk-field-value a {
          color: var(--blue);
        }
        .sk-media {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .sk-media img,
        .sk-media video {
          width: 180px;
          height: 135px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: #000;
          display: block;
        }
        .sk-file {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          background: var(--mist);
          border-radius: 9px;
          color: var(--green-dark);
          font-weight: 600;
        }
        .sk-no-media {
          color: var(--muted);
          font-size: 0.88rem;
        }
        .sk-foot {
          color: var(--muted);
          font-size: 0.78rem;
          margin-top: 12px;
          word-break: break-all;
        }
      `}</style>
      <div className="sk-page">
        <header className="sk-bar">
          <div className="sk-wrap sk-bar-inner">
            <h1>Local Fix - Job Submissions</h1>
            <span className="sk-count">{client ? `${rows.length} ${rows.length === 1 ? "submission" : "submissions"}` : ""}</span>
            <span className="sk-spacer" />
            {client ? (
              <>
                <button className="sk-btn" type="button" onClick={() => loadWith(client)}>
                  Refresh
                </button>
                <button className="sk-btn" type="button" onClick={forget}>
                  Forget key
                </button>
              </>
            ) : null}
          </div>
        </header>

        <main className="sk-wrap">
          {!client ? (
            <section className="sk-gate">
              <div className="sk-card-box">
                <h2>Private review page</h2>
                <p style={{ color: "var(--muted)", marginTop: 0 }}>
                  Paste your Supabase <b>service_role</b> key to load submissions. Find it in your project: <b>Settings - API - Project API keys - service_role (secret)</b>.
                </p>
                <div className="sk-warn" style={{ margin: "0 0 4px" }}>
                  The service_role key has <b>full access</b> to your project. Only use this page on your own computer. Never deploy it to a public site or share the key. It is stored only in this browser, never in the code.
                </div>
                <label htmlFor="keyInput">service_role key</label>
                <input id="keyInput" type="password" placeholder="eyJ..." autoComplete="off" value={key} onChange={(event) => setKey(event.target.value)} onKeyDown={onKeyDown} />
                <div className="sk-row">
                  <input id="remember" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  <label htmlFor="remember" style={{ margin: 0, fontWeight: 500, color: "var(--muted)" }}>
                    Remember on this computer (stores it in this browser)
                  </label>
                </div>
                <button className="sk-btn sk-btn-primary" type="button" onClick={load}>
                  Load submissions
                </button>
                <p className="sk-status err" style={{ padding: "12px 0 0" }}>
                  {gateMessage}
                </p>
              </div>
            </section>
          ) : (
            <>
              {status.text ? <p className={`sk-status${status.err ? " err" : ""}`}>{status.text}</p> : null}
              <div className="sk-list">{rows.map((row) => <SubmissionCard key={row.id} row={row} />)}</div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
