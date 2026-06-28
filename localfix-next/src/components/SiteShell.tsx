import Link from "next/link";
import { ReactNode } from "react";
import { AuthNav } from "./AuthNav";
import { RevealOnScroll } from "./RevealOnScroll";
import { assetPath } from "@/lib/paths";

type NavKey = "home" | "post-job" | "for-workers" | "about" | "contact" | "";

function navClass(active: NavKey, key: NavKey) {
  return active === key ? "active" : undefined;
}

export function SiteHeader({
  active,
  showAbout = false,
  cta,
}: {
  active: NavKey;
  showAbout?: boolean;
  cta?: ReactNode;
}) {
  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Local Fix home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src={assetPath("/logos/Localfix-HorzontalLogoNewBLACK.png")} alt="Local Fix" />
        </Link>

        <div className="nav-links">
          <Link href="/" className={navClass(active, "home")}>
            Home
          </Link>
          <Link href="/post-job" className={navClass(active, "post-job")}>
            Post My Problem
          </Link>
          <Link href="/for-workers" className={navClass(active, "for-workers")}>
            For Workers
          </Link>
          {showAbout ? (
            <Link href="/about" className={navClass(active, "about")}>
              About
            </Link>
          ) : null}
          <Link href="/contact" className={navClass(active, "contact")}>
            Contact
          </Link>
        </div>

        <div className="nav-cta">
          {cta ?? (
            <span className="nav-auth">
              <AuthNav />
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter({ showAbout = false }: { showAbout?: boolean }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Link className="footer-brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="footer-logo" src={assetPath("/logos/Localfix-HorzontalLogoWHITE.png")} alt="Local Fix" />
        </Link>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/post-job">Post My Problem</Link>
          <Link href="/for-workers">For Workers</Link>
          {showAbout ? <Link href="/about">About</Link> : null}
          <Link href="/contact">Contact</Link>
        </nav>
        <p className="footer-note">
          Local Fix connects homeowners with local workers for small home repair jobs. We are not a licensed contractor and do not perform repairs ourselves.
        </p>
      </div>
    </footer>
  );
}

export function MarketingShell({
  active,
  children,
  showAbout = false,
}: {
  active: NavKey;
  children: ReactNode;
  showAbout?: boolean;
}) {
  return (
    <>
      <SiteHeader active={active} showAbout={showAbout} />
      {children}
      <SiteFooter showAbout={showAbout} />
      <RevealOnScroll />
    </>
  );
}

export function AuthPageShell({
  ctaHref,
  ctaLabel,
  children,
}: {
  ctaHref: string;
  ctaLabel: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader active="" cta={<Link className="btn btn-primary" href={ctaHref}>{ctaLabel}</Link>} />
      {children}
    </>
  );
}
