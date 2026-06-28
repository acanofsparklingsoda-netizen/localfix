"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getAnonSupabase, supabaseConfigured } from "@/lib/supabase";

const BUCKET = "job-media";
const TABLE = "job_submissions";

function storageKey(file: File, index: number) {
  const dot = file.name.lastIndexOf(".");
  const ext = dot > -1 ? file.name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  const rand = Math.random().toString(36).slice(2, 8);
  return `submissions/${Date.now()}-${index}-${rand}${ext}`;
}

function value(form: HTMLFormElement, name: string) {
  const data = new FormData(form);
  const raw = data.get(name);
  return typeof raw === "string" ? raw : "";
}

export function PostJobForm() {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [status, setStatus] = useState<{ message: string; ok: boolean } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [hasCarryover, setHasCarryover] = useState(false);
  const started = useRef(Date.now());
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const desc = new URLSearchParams(window.location.search).get("desc");
    if (desc?.trim()) {
      setDescription(desc);
      setHasCarryover(true);
    }
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  async function uploadMedia() {
    const urls: string[] = [];
    const files = Array.from(fileInput.current?.files || []);
    if (!files.length) return urls;

    const sb = getAnonSupabase();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = storageKey(file, i);
      const { error } = await sb.storage.from(BUCKET).upload(key, file, {
        cacheControl: "3600",
        contentType: file.type || undefined,
        upsert: false,
      });
      if (error) throw error;
      const { data } = sb.storage.from(BUCKET).getPublicUrl(key);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (value(form, "website_trap")) {
      setModalOpen(true);
      form.reset();
      setFileNames([]);
      return;
    }
    if (!form.reportValidity()) return;
    if (Date.now() - started.current < 3000) {
      setStatus({ message: "That was a little too quick - give it a moment and try again.", ok: false });
      return;
    }
    if (!supabaseConfigured) {
      setStatus({ message: "Submissions are not configured yet (missing Supabase keys). See SUPABASE-SETUP.md.", ok: false });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const media = await uploadMedia();
      const urgency = new FormData(form).get("urgency");
      const row = {
        category: value(form, "category") || null,
        description: value(form, "description") || null,
        zip: value(form, "location") || null,
        urgency: typeof urgency === "string" ? urgency : null,
        name: value(form, "name") || null,
        phone: value(form, "phone") || null,
        email: value(form, "email") || null,
        consent: new FormData(form).get("consent") === "yes",
        media,
        referer: document.referrer || window.location.href,
      };
      const { error } = await getAnonSupabase().from(TABLE).insert(row);
      if (error) throw error;
      setModalOpen(true);
      form.reset();
      setDescription("");
      setHasCarryover(false);
      setFileNames([]);
      started.current = Date.now();
    } catch (err) {
      setStatus({ message: err instanceof Error ? err.message : "Something went wrong. Please try again.", ok: false });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {hasCarryover ? (
        <div className="carryover-note">
          <b aria-hidden="true">✓</b>
          <span>Got it - we saved what you wrote. Add a few quick details below and you are done.</span>
        </div>
      ) : null}

      <form className="job-post-form" aria-label="Post a repair job" onSubmit={onSubmit}>
        <div className="hp-field" aria-hidden="true">
          <label>
            Leave this field empty
            <input type="text" name="website_trap" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="step-card">
          <span className="step-label">
            <b>1</b> What do you need help with?
          </span>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="category">Job category</label>
            <select id="category" name="category" required defaultValue="">
              <option value="" disabled>
                Choose a category...
              </option>
              <option>Plumbing</option>
              <option>Handyman</option>
              <option>Electrical</option>
              <option>Painting</option>
              <option>Drywall</option>
              <option>Appliance repair</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="step-card">
          <span className="step-label">
            <b>2</b> Show us the problem
          </span>
          <label className="upload-drop" htmlFor="media">
            <span style={{ fontSize: "1.5rem" }} aria-hidden="true">
              📷
            </span>
            Upload a photo or video
            <small>This helps workers understand the job before they respond.</small>
          </label>
          <input
            ref={fileInput}
            id="media"
            className="file-input"
            name="media"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(event) => setFileNames(Array.from(event.target.files || []).map((file) => file.name))}
          />
          <div className="file-list" aria-live="polite">
            {fileNames.length ? `Attached: ${fileNames.join(", ")}` : ""}
          </div>
        </div>

        <div className="step-card">
          <span className="step-label">
            <b>3</b> Tell us what is happening
          </span>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="description">Describe your issue</label>
            <textarea
              id="description"
              name="description"
              className={hasCarryover ? "field-flash" : undefined}
              placeholder="Example: My kitchen sink is leaking underneath."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="step-card">
          <span className="step-label">
            <b>4</b> Where is the job located?
          </span>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="location">ZIP code</label>
            <input id="location" name="location" type="text" inputMode="numeric" maxLength={5} pattern="[0-9]{5}" title="Enter a 5-digit ZIP code" placeholder="e.g. 78701" required />
          </div>
        </div>

        <div className="step-card">
          <span className="step-label">
            <b>5</b> How urgent is it?
          </span>
          <div className="choice-row" role="radiogroup" aria-label="Urgency">
            <label className="choice">
              <input type="radio" name="urgency" value="Today" />
              <span>Today</span>
            </label>
            <label className="choice">
              <input type="radio" name="urgency" value="Tomorrow" />
              <span>Tomorrow</span>
            </label>
            <label className="choice">
              <input type="radio" name="urgency" value="This week" defaultChecked />
              <span>This week</span>
            </label>
            <label className="choice">
              <input type="radio" name="urgency" value="Flexible" />
              <span>Flexible</span>
            </label>
          </div>
        </div>

        <div className="step-card">
          <span className="step-label">
            <b>6</b> How should someone contact you?
          </span>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" placeholder="Your name" required />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" placeholder="you@email.com" required />
            </div>
          </div>
        </div>

        <div className="step-card">
          <span className="step-label">
            <b>7</b> Submit your request
          </span>
          <label className="consent">
            <input type="checkbox" id="consent" name="consent" value="yes" required />
            <span>By submitting this form, you agree to be contacted about your repair request.</span>
          </label>
          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Submit request"}
          </button>
        </div>
      </form>

      <p className={`form-status${status ? (status.ok ? " is-ok" : " is-err") : ""}`} role="status" aria-live="polite">
        {status?.message || ""}
      </p>

      <div className={`modal-overlay${modalOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="jobModalTitle" hidden={!modalOpen} onClick={(event) => event.target === event.currentTarget && setModalOpen(false)}>
        <div className="modal-card" role="document">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <h2 id="jobModalTitle">Your job has been posted</h2>
          <p>We will contact you when a local worker is available. Keep an eye on your phone and email.</p>
          <div className="modal-actions">
            <Link className="btn btn-primary" href="/">
              Back to home
            </Link>
            <button className="btn btn-ghost" type="button" onClick={() => setModalOpen(false)}>
              Post another
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
