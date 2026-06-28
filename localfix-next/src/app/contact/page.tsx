import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { MarketingShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Contact | Local Fix",
  description: "Get in touch with Local Fix. Email, phone, and a quick contact form.",
};

export default function ContactPage() {
  return (
    <MarketingShell active="contact">
      <main>
        <div className="page-head">
          <p className="eyebrow">Contact</p>
          <h1>Get in touch</h1>
          <p>Questions about a job, a worker account, or the service? Send us a note and we will get back to you.</p>
        </div>

        <section className="section" style={{ paddingTop: 36 }}>
          <div className="wrap">
            <div className="contact-grid">
              <div className="contact-info">
                <div className="contact-item">
                  <h3>Email</h3>
                  <p>
                    <a href="mailto:hello@localfix.example">hello@localfix.example</a>
                  </p>
                </div>
                <div className="contact-item">
                  <h3>Phone</h3>
                  <p>
                    <a href="tel:+15551234567">(555) 123-4567</a>
                  </p>
                </div>
                <div className="contact-item">
                  <h3>Service area</h3>
                  <p>Currently serving local neighborhoods and nearby areas. Posting a job is the fastest way to check if we cover you.</p>
                </div>
                <div className="contact-item">
                  <h3>Follow along</h3>
                  <p>Social links coming soon as we grow.</p>
                </div>
              </div>

              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
