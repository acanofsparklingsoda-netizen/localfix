import type { Metadata } from "next";
import { MarketingShell } from "@/components/SiteShell";
import { PostJobForm } from "@/components/PostJobForm";

export const metadata: Metadata = {
  title: "Post My Problem | Local Fix",
  description: "Submit your home repair request in a few simple steps. Add a photo or video, your location, and how to reach you.",
};

export default function PostJobPage() {
  return (
    <MarketingShell active="post-job">
      <main>
        <div className="page-head">
          <h1>Post My Problem</h1>
          <p>Tell us what needs fixing. It is free, there is no obligation, and local workers will review the details.</p>
        </div>

        <section className="section section-compact-top post-job-section">
          <div className="post-flow-wrap">
            <PostJobForm />
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
