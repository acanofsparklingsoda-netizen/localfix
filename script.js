// Show selected file names under an upload control.
const mediaInput = document.querySelector("#media");
const fileList = document.querySelector("#fileList");

if (mediaInput && fileList) {
  mediaInput.addEventListener("change", () => {
    const names = Array.from(mediaInput.files).map((file) => file.name);
    fileList.textContent = names.length ? `Attached: ${names.join(", ")}` : "";
  });
}

// Generic "submit -> hide form, show confirmation" wiring.
// Pairs a form id with the success-message id to reveal.
function wireForm(formId, successId) {
  const form = document.querySelector(formId);
  const success = document.querySelector(successId);
  if (!form || !success) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }
    form.style.display = "none";
    success.classList.add("show");
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

wireForm("#jobForm", "#jobSuccess");
wireForm("#workerForm", "#workerSuccess");
wireForm("#contactForm", "#contactSuccess");

// Basic fade-up reveal as sections scroll into view.
(function revealOnScroll() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const targets = document.querySelectorAll(
    ".section-head, .step, .trust-card, .job-tag, .work-card, .worker-band, " +
      ".faq, .cta-banner, .start-card, .form-card, .step-card, .contact-item, " +
      ".page-head, .prose > *, .hero-stats"
  );

  if (!targets.length) {
    return;
  }

  targets.forEach((el) => {
    el.classList.add("reveal");
    // Light stagger for items that sit side by side in a group.
    const siblings = Array.from(el.parentElement.children).filter((c) =>
      c.classList.contains("reveal")
    );
    const index = siblings.indexOf(el);
    if (index > 0) {
      el.style.transitionDelay = Math.min(index * 70, 280) + "ms";
    }
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
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
})();

// Carry the homepage quick-start text into the Post My Problem description,
// and make it obvious to the visitor that what they typed was kept.
const description = document.querySelector("#description");
const jobForm = document.querySelector("#jobForm");
if (description && jobForm) {
  const desc = new URLSearchParams(window.location.search).get("desc");
  if (desc && desc.trim()) {
    description.value = desc;
    description.classList.add("field-flash");

    const note = document.createElement("div");
    note.className = "carryover-note";
    note.innerHTML =
      "<b aria-hidden=\"true\">✓</b><span>Got it — we saved what you wrote. Add a few quick details below and you’re done.</span>";
    jobForm.parentNode.insertBefore(note, jobForm);
  }
}
