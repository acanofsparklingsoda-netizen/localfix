"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeaderFallback, RoleAppHeader } from "./AccountChrome";
import { type AuthUser, useAuth } from "./AuthProvider";
import { BodyClass } from "./BodyClass";
import { CalendarIcon, ClockIcon, DoubleDownIcon, InfoIcon, PinIcon, SearchIcon, WrenchIcon, XIcon } from "./Icons";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

type Job = {
  id: string | number;
  created_at?: string | null;
  category?: string | null;
  urgency?: string | null;
  zip?: string | null;
  description?: string | null;
  media?: unknown;
};

function mediaItems(media: unknown): string[] {
  return Array.isArray(media) ? media.filter((item): item is string => typeof item === "string" && /^https?:\/\//i.test(item)) : [];
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url.split("?")[0]);
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function longDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function urgClass(urgency?: string | null) {
  const text = (urgency || "").toLowerCase();
  if (text.includes("today")) return "lf-badge--today";
  if (text.includes("flex")) return "lf-badge--flex";
  return "lf-badge--week";
}

function ReelMedia({ url }: { url: string }) {
  if (isVideo(url)) return <video src={url} muted loop playsInline preload="metadata" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} loading="lazy" alt="job photo" />
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="lf-reel-stat">
      <span className="lf-reel-stat-ic">{icon}</span>
      <div>
        <div className="lf-reel-stat-label">{label}</div>
        <div className="lf-reel-stat-val">{value}</div>
      </div>
    </div>
  );
}

function JobReel({ job, onOpen }: { job: Job; onOpen: (job: Job) => void }) {
  const first = mediaItems(job.media)[0];

  return (
    <div className="lf-reel">
      <div className="lf-reel-frame">
        {first ? (
          <div className="lf-reel-media">
            <ReelMedia url={first} />
          </div>
        ) : (
          <div className="lf-reel-noimg">
            <WrenchIcon />
          </div>
        )}
        <div className="lf-reel-scrim" />
        <div className="lf-reel-top">
          <span className="lf-reel-date">{fmtDate(job.created_at)}</span>
        </div>
        <div className="lf-reel-body">
          <div className="lf-reel-meta">
            {job.category ? <Stat icon={<WrenchIcon />} label="Category" value={job.category} /> : null}
            {job.urgency ? <Stat icon={<CalendarIcon />} label="Timing" value={job.urgency} /> : null}
            <Stat icon={<PinIcon />} label="Area" value={job.zip || "-"} />
          </div>
          <p className="lf-reel-desc">{job.description || "-"}</p>
          <div className="lf-reel-actions">
            <button className="lf-reel-btn" type="button" onClick={() => onOpen(job)}>
              <InfoIcon />
              <span>View details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="lf-empty">
      <div className="lf-mark">
        <SearchIcon />
      </div>
      <h3>No jobs posted yet</h3>
      <p>Check back soon - new repair jobs show up here.</p>
    </div>
  );
}

function JobModal({ job, onClose, onLightbox }: { job: Job; onClose: () => void; onLightbox: (url: string) => void }) {
  const [note, setNote] = useState("");
  const media = mediaItems(job.media);
  const first = media[0];
  const rest = media.slice(1);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lf-jobmodal-overlay open" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="lf-jobmodal" role="dialog" aria-modal="true" aria-label="Job details">
        <button className="lf-jm-x" type="button" aria-label="Close" onClick={onClose}>
          <XIcon />
        </button>
        <div className={`lf-jm-hero${first ? "" : " noimg"}`}>
          {first ? (
            isVideo(first) ? (
              <video src={first} controls playsInline preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={first} alt="job photo" onClick={() => onLightbox(first)} />
            )
          ) : (
            <WrenchIcon />
          )}
        </div>
        <div className="lf-jm-body">
          <div className="lf-jm-ref">Job #{job.id}</div>
          <p className="lf-jm-desc">{job.description || "-"}</p>
          <div className="lf-jm-meta">
            <div className="lf-jm-meta-item">
              <span className="lf-jm-meta-ic">
                <WrenchIcon />
              </span>
              <div>
                <div className="lf-jm-meta-label">Category</div>
                <div className="lf-jm-meta-val">{job.category ? <span className="lf-badge lf-badge--cat">{job.category}</span> : "-"}</div>
              </div>
            </div>
            <div className="lf-jm-meta-item">
              <span className="lf-jm-meta-ic">
                <CalendarIcon />
              </span>
              <div>
                <div className="lf-jm-meta-label">Timing</div>
                <div className="lf-jm-meta-val">{job.urgency ? <span className={`lf-badge ${urgClass(job.urgency)}`}>{job.urgency}</span> : "-"}</div>
              </div>
            </div>
            <div className="lf-jm-meta-item">
              <span className="lf-jm-meta-ic">
                <PinIcon />
              </span>
              <div>
                <div className="lf-jm-meta-label">Area</div>
                <div className="lf-jm-meta-val">{job.zip ? `ZIP ${job.zip}` : "Not given"}</div>
              </div>
            </div>
            <div className="lf-jm-meta-item">
              <span className="lf-jm-meta-ic">
                <ClockIcon />
              </span>
              <div>
                <div className="lf-jm-meta-label">Posted</div>
                <div className="lf-jm-meta-val">{longDate(job.created_at) || "-"}</div>
              </div>
            </div>
          </div>
          {rest.length ? (
            <div>
              <div className="lf-jm-thumbs">
                {rest.map((url) =>
                  isVideo(url) ? (
                    <video key={url} src={url} controls playsInline preload="metadata" />
                  ) : (
                    <button key={url} className="lf-thumb-button" type="button" onClick={() => onLightbox(url)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} loading="lazy" alt="job photo" />
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div className="lf-jm-foot">
          <button className="btn btn-primary btn-lg" type="button" onClick={() => setNote(`Interest noted for Job #${job.id} - connecting you with the homeowner is coming soon.`)}>
            I am interested in this job
          </button>
          <p className="lf-jm-note">{note}</p>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lf-lightbox open" onClick={(event) => event.target !== (event.currentTarget.querySelector("img") as HTMLImageElement) && onClose()}>
      <button className="lf-lightbox-x" type="button" aria-label="Close" onClick={onClose}>
        <XIcon />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Job photo" />
    </div>
  );
}

export function ContractorBoard() {
  const router = useRouter();
  const { ready: authReady, profileReady, user } = useAuth();
  const reelsRef = useRef<HTMLDivElement>(null);
  const loadedFor = useRef("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [center, setCenter] = useState<React.ReactNode>("Loading jobs...");
  const [showJobs, setShowJobs] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [lightbox, setLightbox] = useState("");

  const centerNode = useMemo(() => (typeof center === "string" ? <p className="lf-msg">{center}</p> : center), [center]);

  async function loadJobs(sessionUser: AuthUser) {
    const sb = getSupabase();
    setCenter("Loading jobs...");
    const role = sessionUser.role;
    if (role === "homeowner") {
      router.push("/post-job");
      return;
    }

    if (role === "contractor" && sessionUser.approved === false) {
      setShowJobs(false);
      setCenter(<div className="lf-pending-card">Your account is pending approval. You will see jobs here once an admin approves you.</div>);
      return;
    }

    const res = await sb.rpc("list_jobs_for_contractor");
    if (res.error) {
      setShowJobs(false);
      setCenter(<p className="lf-msg is-err">Could not load jobs: {res.error.message}</p>);
      return;
    }
    const nextJobs = (res.data || []) as Job[];
    if (!nextJobs.length) {
      setShowJobs(false);
      setCenter(<EmptyState />);
      return;
    }
    setJobs(nextJobs);
    setShowJobs(true);
    setShowHint(nextJobs.length > 1);
  }

  useEffect(() => {
    if (!supabaseConfigured) {
      setCenter(<p className="lf-msg is-err">Sign-in is not configured yet (missing Supabase keys).</p>);
      return;
    }
    if (!authReady || !profileReady) {
      setCenter("Loading jobs...");
      return;
    }
    if (!user) {
      router.push("/login?next=/contractors");
      return;
    }
    if (user.role === "homeowner") {
      router.push("/post-job");
      return;
    }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    loadJobs(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, profileReady, router, user?.id, user?.role, user?.approved]);

  useEffect(() => {
    if (!showJobs || !reelsRef.current) return;
    const root = reelsRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector("video");
          if (!video) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) video.play().catch(() => undefined);
          else video.pause();
        });
      },
      { root, threshold: [0, 0.6, 1] },
    );
    Array.from(root.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [jobs, showJobs]);

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/");
  }

  return (
    <>
      <BodyClass className="lf-app lf-reels-page" />
      {user && user.role !== "homeowner" ? <RoleAppHeader user={user} activeHref="/contractors" onLogout={logout} /> : <AppHeaderFallback activeHref="/contractors" />}
      <main className="lf-reels-main">
        {showHint ? (
          <div className="lf-reel-hint">
            <DoubleDownIcon />
          </div>
        ) : null}
        <div className="lf-reels-center" hidden={showJobs}>
          {centerNode}
        </div>
        <div ref={reelsRef} className="lf-reels" hidden={!showJobs} onScroll={() => setShowHint(false)}>
          {jobs.map((job) => (
            <JobReel key={job.id} job={job} onOpen={setActiveJob} />
          ))}
        </div>
      </main>

      {activeJob ? <JobModal job={activeJob} onClose={() => setActiveJob(null)} onLightbox={setLightbox} /> : null}
      {lightbox ? <Lightbox url={lightbox} onClose={() => setLightbox("")} /> : null}
    </>
  );
}
