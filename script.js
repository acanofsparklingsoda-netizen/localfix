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

wireForm("#contactForm", "#contactSuccess");

// Post My Problem form -> upload media to Supabase Storage, insert a row in the
// job_submissions table (with the file URLs), then show the confirmation popup.
(function wireJobForm() {
  const form = document.querySelector("#jobForm");
  const modal = document.querySelector("#jobModal");
  const status = document.querySelector("#jobStatus");
  if (!form || !modal) {
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const closeBtn = document.querySelector("#jobModalClose");
  const BUCKET = "job-media";
  const TABLE = "job_submissions";
  let started = Date.now(); // time gate: blocks instant bot posts

  // Build the Supabase client (config lives in supabase-config.js).
  const ready =
    window.supabase &&
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !/YOUR-/.test(window.SUPABASE_URL + window.SUPABASE_ANON_KEY);
  // Always post as an anonymous public visitor — even if an admin/worker is logged
  // in. Posting a job is a public action, so the request must run under the anon
  // role (which the RLS policies allow). persistSession:false ignores any saved login.
  const sb = ready
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  function say(message, ok) {
    if (!status) {
      return;
    }
    status.textContent = message || "";
    status.className = "form-status" + (message ? (ok ? " is-ok" : " is-err") : "");
  }

  function openModal() {
    modal.hidden = false;
    // next frame so the CSS transition runs
    requestAnimationFrame(() => modal.classList.add("open"));
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeModal() {
    modal.classList.remove("open");
    const done = () => {
      modal.hidden = true;
      modal.removeEventListener("transitionend", done);
    };
    modal.addEventListener("transitionend", done);
    // fallback in case transitionend doesn't fire
    setTimeout(done, 350);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  // Safe-ish object key for Storage: keep the extension, strip the rest.
  function storageKey(file, index) {
    const dot = file.name.lastIndexOf(".");
    const ext = dot > -1 ? file.name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
    const rand = Math.random().toString(36).slice(2, 8);
    return `submissions/${Date.now()}-${index}-${rand}${ext}`;
  }

  // Upload every attached file, return an array of public URLs.
  async function uploadMedia() {
    const urls = [];
    if (!mediaInput || !mediaInput.files.length) {
      return urls;
    }
    const files = Array.from(mediaInput.files);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = storageKey(file, i);
      const { error } = await sb.storage.from(BUCKET).upload(key, file, {
        cacheControl: "3600",
        contentType: file.type || undefined,
        upsert: false,
      });
      if (error) {
        throw error;
      }
      const { data } = sb.storage.from(BUCKET).getPublicUrl(key);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Honeypot: a real person never fills this. Pretend it worked, do nothing.
    if (form.website_trap && form.website_trap.value) {
      openModal();
      form.reset();
      return;
    }
    if (!form.reportValidity()) {
      return;
    }
    // Time gate: instant submits are almost always bots.
    if (Date.now() - started < 3000) {
      say("That was a little too quick — give it a moment and try again.", false);
      return;
    }
    if (!sb) {
      say("Submissions aren’t configured yet (missing Supabase keys). See SUPABASE-SETUP.md.", false);
      return;
    }

    const original = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    say("", true);

    try {
      const media = await uploadMedia();
      const row = {
        category: form.category ? form.category.value : null,
        description: form.description ? form.description.value : null,
        zip: form.location ? form.location.value : null,
        urgency: form.urgency ? form.urgency.value : null,
        name: form.name ? form.name.value : null,
        phone: form.phone ? form.phone.value : null,
        email: form.email ? form.email.value : null,
        consent: !!(form.consent && form.consent.checked),
        media: media,
        referer: document.referrer || window.location.href,
      };
      const { error } = await sb.from(TABLE).insert(row);
      if (error) {
        throw error;
      }
      openModal();
      form.reset();
      started = Date.now();
      if (fileList) {
        fileList.textContent = "";
      }
    } catch (err) {
      say((err && err.message) || "Something went wrong. Please try again.", false);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
    }
  });
})();

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
