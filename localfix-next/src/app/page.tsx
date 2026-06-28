import Link from "next/link";
import { MarketingShell } from "@/components/SiteShell";
import { CameraIcon, PinIcon, ShieldCheckIcon, TagIcon } from "@/components/Icons";
import { assetPath } from "@/lib/paths";

const jobTags = [
  "Plumbing leaks",
  "Clogged drains",
  "Toilet repairs",
  "Faucet repairs",
  "Drywall patches",
  "Painting",
  "Door repairs",
  "Light fixture issues",
  "Appliance installation",
  "General handyman work",
];

export default function Home() {
  return (
    <MarketingShell active="home">
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div className="hero-left">
              <p className="eyebrow">Plumbing · Handyman · Home repairs</p>
              <h1 id="hero-title">Get help with plumbing, handyman, and home repair issues near you.</h1>
              <p className="hero-copy">
                Post a photo or video of the problem, share your location, and local workers can review the job and respond. It only takes a minute.
              </p>
              <div className="hero-stats" aria-label="Local Fix at a glance">
                <div className="hero-stat">
                  <strong>4,200+</strong>
                  <span>jobs completed</span>
                </div>
                <div className="hero-stat">
                  <strong>900+</strong>
                  <span>local pros</span>
                </div>
                <div className="hero-stat">
                  <strong>4.9★</strong>
                  <span>avg rating</span>
                </div>
              </div>
            </div>

            <div className="start-card">
              <p className="eyebrow">Start here</p>
              <h2>Post your repair - it&apos;s free</h2>
              <p className="start-sub">Describe the problem and add a photo on the next step. The whole thing takes about a minute.</p>
              <Link className="btn btn-primary btn-lg btn-block" href="/post-job">
                Post My Problem
              </Link>
              <div className="start-reassure">
                <span>Free to post</span>
                <span>No obligation</span>
                <span>1 minute</span>
              </div>
              <p className="start-help">
                <a href="#how-it-works">See how it works ↓</a>
              </p>
            </div>
          </div>
        </section>

        <section className="section section-tint" id="how-it-works" aria-labelledby="how-title">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">How It Works</p>
              <h2 id="how-title">Three simple steps</h2>
              <p>The process is easy and low-risk - you stay in control the whole way.</p>
            </div>

            <div className="steps">
              <article className="step">
                <div className="step-num">1</div>
                <h3>Post the issue</h3>
                <p>Upload a photo or video, describe the problem, and add your location.</p>
              </article>
              <article className="step">
                <div className="step-num">2</div>
                <h3>Local workers review it</h3>
                <p>Available plumbers, handymen, or contractors look at the job details.</p>
              </article>
              <article className="step">
                <div className="step-num">3</div>
                <h3>Choose who to contact</h3>
                <p>Compare responses and decide who you want to speak with.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="jobs-title">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Common Jobs You Can Post</p>
              <h2 id="jobs-title">What kind of help do you need?</h2>
              <p>If your repair is on this list, Local Fix is for you.</p>
            </div>

            <div className="job-tags">
              {jobTags.map((job) => (
                <Link className="job-tag" href={`/post-job?desc=${encodeURIComponent(job)}`} key={job}>
                  {job}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-mist" aria-labelledby="trust-title">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Why homeowners use Local Fix</p>
              <h2 id="trust-title">A simpler way to find help for small home repair jobs.</h2>
              <p>
                Instead of calling multiple people and explaining the same issue again and again, upload the problem once and let local workers decide if
                they can help.
              </p>
            </div>

            <div className="trust-grid">
              <article className="trust-card">
                <div className="trust-icon" aria-hidden="true">
                  <PinIcon />
                </div>
                <h3>Local workers</h3>
                <p>Your request is reviewed by people who serve your area.</p>
              </article>
              <article className="trust-card">
                <div className="trust-icon" aria-hidden="true">
                  <CameraIcon />
                </div>
                <h3>Photos help workers</h3>
                <p>Better details can lead to faster, more accurate responses.</p>
              </article>
              <article className="trust-card">
                <div className="trust-icon" aria-hidden="true">
                  <ShieldCheckIcon />
                </div>
                <h3>No obligation</h3>
                <p>Posting a job does not force you to hire anyone.</p>
              </article>
              <article className="trust-card">
                <div className="trust-icon" aria-hidden="true">
                  <TagIcon />
                </div>
                <h3>Simple and free</h3>
                <p>Submitting a repair request is free for homeowners.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="worker-title">
          <div className="wrap">
            <div className="worker-band">
              <div className="worker-band-text">
                <p className="eyebrow worker-eyebrow">Are You a Local Worker?</p>
                <h2 id="worker-title">Get notified when homeowners near you post jobs.</h2>
                <p>
                  Review plumbing, handyman, and repair jobs in your area, see the details and photos, and decide which jobs are worth responding to.
                </p>
                <Link className="btn btn-lg worker-cta" href="/for-workers">
                  Join as a Worker <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="worker-art">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetPath("/assets/cabinet-before-after.png")} alt="Before and after of a completed repair job" />
              </div>
            </div>
          </div>
        </section>

        <section className="section section-tint" aria-labelledby="faq-title">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">FAQ</p>
              <h2 id="faq-title">Frequently asked questions</h2>
            </div>

            <div className="faq-list">
              <details className="faq">
                <summary>Is it free to post a job?</summary>
                <p>Yes, homeowners can submit a repair request for free.</p>
              </details>
              <details className="faq">
                <summary>Do I have to hire someone?</summary>
                <p>No. Posting a job does not require you to hire anyone.</p>
              </details>
              <details className="faq">
                <summary>What types of jobs can I post?</summary>
                <p>You can post plumbing, handyman, and general home repair jobs.</p>
              </details>
              <details className="faq">
                <summary>Why should I upload a photo or video?</summary>
                <p>Photos and videos help workers understand the problem before responding.</p>
              </details>
              <details className="faq">
                <summary>How fast will someone respond?</summary>
                <p>Response times depend on worker availability and the type of job.</p>
              </details>
              <details className="faq">
                <summary>Are workers verified?</summary>
                <p>
                  Local Fix is new and growing. Right now we collect each worker&apos;s trade, service area, and experience when they sign up, but we do not
                  yet run background checks or verify licenses and insurance.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="cta-title">
          <div className="wrap">
            <div className="cta-banner">
              <h2 id="cta-title">Ready to get your repair handled?</h2>
              <p>Upload your repair issue once and let local workers come to you.</p>
              <Link className="btn btn-primary btn-lg" href="/post-job">
                Post My Problem
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
