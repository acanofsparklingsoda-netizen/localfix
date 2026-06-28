"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSent(true);
    requestAnimationFrame(() => {
      document.getElementById("contactSuccess")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <>
      {!sent ? (
        <form className="form-card" aria-label="Contact form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="c-name">Name</label>
            <input id="c-name" name="name" type="text" placeholder="Your name" required />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="c-email">Email</label>
              <input id="c-email" name="email" type="email" placeholder="you@email.com" required />
            </div>
            <div className="field">
              <label htmlFor="c-phone">
                Phone <span className="hint">(optional)</span>
              </label>
              <input id="c-phone" name="phone" type="tel" placeholder="(555) 123-4567" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="c-message">Message</label>
            <textarea id="c-message" name="message" placeholder="How can we help?" required />
          </div>
          <button className="btn btn-primary btn-lg btn-block" type="submit">
            Send message
          </button>
        </form>
      ) : null}

      <div className={`form-success${sent ? " show" : ""}`} id="contactSuccess" role="status">
        <div className="success-mark" aria-hidden="true">
          ✓
        </div>
        <h2>Message sent.</h2>
        <p>Thanks for reaching out - we will get back to you soon.</p>
      </div>
    </>
  );
}
