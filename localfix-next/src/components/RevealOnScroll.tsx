"use client";

import { useEffect } from "react";

export function RevealOnScroll() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".section-head, .step, .trust-card, .job-tag, .work-card, .worker-band, " +
          ".faq, .cta-banner, .start-card, .form-card, .step-card, .contact-item, " +
          ".page-head, .prose > *, .hero-stats",
      ),
    );

    targets.forEach((el) => {
      el.classList.add("reveal");
      const siblings = Array.from(el.parentElement?.children || []).filter((child) =>
        child.classList.contains("reveal"),
      );
      const index = siblings.indexOf(el);
      if (index > 0) el.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
