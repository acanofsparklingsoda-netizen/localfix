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
          background:
            linear-gradient(180deg, #f8faf6 0%, #eef5ef 46%, #fbfaf7 100%);
          min-height: 100vh;
        }
        .sk-wrap {
          width: min(1120px, calc(100% - 32px));
          margin: 0 auto;
        }
        .sk-bar {
          position: sticky;
          top: 76px;
          z-index: 5;
          background: rgba(248, 250, 246, 0.92);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--line);
          box-shadow: 0 8px 22px rgba(28, 39, 33, 0.05);
        }
        @media (max-width: 860px) {
          .sk-bar {
            top: 116px;
          }
        }
        .sk-bar-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          min-height: 64px;
          padding: 10px 0;
        }
        .sk-bar h1 {
          color: #18231d;
          font-size: 1.18rem;
          margin: 0;
          line-height: 1.15;
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
          min-height: 40px;
          padding: 0 16px;
          border-radius: 8px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(28, 39, 33, 0.04);
        }
        .sk-btn:hover {
          border-color: var(--green);
        }
        .sk-btn-primary {
          background: linear-gradient(180deg, #69b977 0%, #4f9d60 100%);
          border-color: var(--green);
          color: #fff;
        }
        .sk-warn {
          background: #eef7f0;
          border: 1px solid #cfe2d5;
          color: var(--green-dark);
          padding: 14px 16px;
          border-radius: 8px;
          margin: 18px 0;
          font-size: 0.92rem;
        }
        .sk-warn-tight {
          margin: 0 0 4px;
        }
        .sk-gate {
          max-width: 560px;
          margin: 78px auto;
          text-align: center;
        }
        .sk-card-box {
          position: relative;
          overflow: hidden;
          background: #fff;
          border: 1px solid #d2ded7;
          border-radius: 8px;
          padding: 36px;
          box-shadow: 0 22px 52px rgba(28, 39, 33, 0.13);
          text-align: left;
        }
        .sk-card-box::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 5px;
          background: linear-gradient(90deg, var(--green) 0%, var(--green-dark) 100%);
        }
        .sk-card-box h2 {
          margin-top: 0;
          color: #18231d;
          font-size: 1.6rem;
          line-height: 1.1;
        }
        .sk-muted-copy {
          color: var(--muted);
          margin-top: 0;
          line-height: 1.55;
        }
        .sk-card-box label {
          display: block;
          color: #24332b;
          font-weight: 750;
          margin: 16px 0 6px;
        }
        .sk-card-box input[type="password"] {
          width: 100%;
          min-height: 50px;
          padding: 12px 14px;
          border: 1px solid #cfdcd5;
          border-radius: 8px;
          font: inherit;
          background: #fbfcfa;
        }
        .sk-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 14px 0 20px;
          font-size: 0.9rem;
          color: var(--muted);
        }
        .sk-check-label {
          margin: 0;
          color: var(--muted);
          font-weight: 500;
        }
        .sk-status {
          color: var(--muted);
          padding: 24px 0;
        }
        .sk-gate-message {
          padding: 12px 0 0;
        }
        .sk-status.err {
          color: var(--clay);
          font-weight: 600;
        }
        .sk-list {
          display: grid;
          gap: 16px;
          padding: 30px 0 70px;
        }
        .sk-card {
          background: #fff;
          border: 1px solid #d2ded7;
          border-radius: 8px;
          padding: 22px 24px;
          box-shadow: 0 8px 22px rgba(28, 39, 33, 0.06);
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
          background: #edf6ef;
          color: var(--green-dark);
          border-color: #cfe2d5;
        }
        .sk-status-chip.s-sent,
        .sk-status-chip.s-interested {
          background: #eef4ee;
          color: #2f7445;
          border-color: #d6e5da;
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
          color: #fff;
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
          width: 184px;
          height: 138px;
          object-fit: cover;
          border-radius: 8px;
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
                <p className="sk-muted-copy">
                  Paste your Supabase <b>service_role</b> key to load submissions. Find it in your project: <b>Settings - API - Project API keys - service_role (secret)</b>.
                </p>
                <div className="sk-warn sk-warn-tight">
                  The service_role key has <b>full access</b> to your project. Only use this page on your own computer. Never deploy it to a public site or share the key. It is stored only in this browser, never in the code.
                </div>
                <label htmlFor="keyInput">service_role key</label>
                <input id="keyInput" type="password" placeholder="eyJ..." autoComplete="off" value={key} onChange={(event) => setKey(event.target.value)} onKeyDown={onKeyDown} />
                <div className="sk-row">
                  <input id="remember" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  <label htmlFor="remember" className="sk-check-label">
                    Remember on this computer (stores it in this browser)
                  </label>
                </div>
                <button className="sk-btn sk-btn-primary" type="button" onClick={load}>
                  Load submissions
                </button>
                <p className="sk-status err sk-gate-message">
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
