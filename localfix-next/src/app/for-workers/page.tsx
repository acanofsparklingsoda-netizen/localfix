import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/SiteShell";
import { CheckCircleIcon, ClockIcon, ImageIcon, PinIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "For Workers | Local Fix",
  description: "Get notified when homeowners near you post plumbing, handyman, or repair jobs. Review the details and decide which jobs are worth responding to.",
};

export default function ForWorkersPage() {
  return (
    <MarketingShell active="for-workers">
      <main>
        <div className="page-head">
          <p className="eyebrow">For local workers &amp; contractors</p>
          <h1>Get jobs from homeowners near you.</h1>
          <p>Get notified when homeowners near you post plumbing, handyman, or repair jobs. Review the details and decide which jobs are worth responding to.</p>
        </div>

        <section className="section section-compact-top">
          <div className="wrap">
            <div className="worker-perks">
              <article className="worker-perk">
                <div className="perk-icon">
                  <PinIcon />
                </div>
                <h3>Jobs near you</h3>
                <p>See repair jobs posted right in the areas you actually serve.</p>
              </article>
              <article className="worker-perk">
                <div className="perk-icon">
                  <ImageIcon />
                </div>
                <h3>See the details first</h3>
                <p>Photos, a description, and the location up front - size up a job before you go.</p>
              </article>
              <article className="worker-perk">
                <div className="perk-icon">
                  <CheckCircleIcon />
                </div>
                <h3>You choose</h3>
                <p>Only take the jobs that are worth your time - no pressure, no obligation.</p>
              </article>
              <article className="worker-perk">
                <div className="perk-icon">
                  <ClockIcon />
                </div>
                <h3>Work on your terms</h3>
                <p>Browse whenever it suits you and respond to the jobs that fit your schedule.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-mist worker-join-section" id="worker-form">
          <div className="narrow">
            <div className="section-head">
              <p className="eyebrow">Join as a Worker</p>
              <h2>Sign up to start picking up jobs</h2>
            </div>

            <div className="form-card worker-join-card">
              <h3>Create your free worker account</h3>
              <p>
                Browse repair jobs homeowners post near you, see the photos and details before you go, and get connected - there is no fee to sign up.
              </p>
              <Link className="btn btn-primary btn-lg" href="/signup?type=contractor&next=/contractors">
                Sign up as a worker
              </Link>
              <p className="worker-join-login">
                Already have an account?{" "}
                <Link href="/login?next=/contractors">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
