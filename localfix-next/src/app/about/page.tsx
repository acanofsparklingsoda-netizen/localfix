import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "About | Local Fix",
  description: "Why we built Local Fix - a simpler way for homeowners to get help with small home repair jobs.",
};

export default function AboutPage() {
  return (
    <MarketingShell active="about" showAbout>
      <main>
        <div className="page-head">
          <p className="eyebrow">About Local Fix</p>
          <h1>Why we built this</h1>
        </div>

        <section className="section section-compact-top">
          <div className="prose">
            <p>
              Finding help for small home repair jobs can be frustrating. Homeowners often call multiple people, send photos one by one, and wait for replies. This website makes the process simpler by letting homeowners post the issue once so local workers can review the details and respond if they are available.
            </p>

            <h2>How it works in practice</h2>
            <p>
              You upload a photo or video of the problem, add a short description and your location, and tell us how urgent it is. That single post is shared with workers who serve your area. They review the details and decide whether they can help - and you decide who to talk to. No phone tag, no repeating yourself.
            </p>

            <h2>What we are - and what we are not</h2>
            <p>
              Local Fix is a way to connect homeowners with local workers. We do not perform repairs ourselves, and we are honest about being new: we collect each worker's trade, service area, and experience at signup, but we do not yet run background checks or verify licenses and insurance. Always confirm credentials directly with anyone before hiring.
            </p>

            <h2>Our goal</h2>
            <p>Keep it human and simple. Post the problem once, let the right local people see it, and make small repairs less of a headache.</p>

            <p className="prose-actions">
              <Link className="btn btn-primary btn-lg" href="/post-job">
                Post My Problem
              </Link>
              <Link className="btn btn-ghost btn-lg" href="/contact">
                Contact Us
              </Link>
            </p>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
