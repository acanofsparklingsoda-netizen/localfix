"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { type ReactNode, useEffect, useState } from "react";
import {
  BriefcaseIcon,
  ChartIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InboxIcon,
  LogoutIcon,
  MessageIcon,
  UserIcon,
  XIcon,
} from "./Icons";
import { assetPath } from "@/lib/paths";

export type AccountUser = {
  email: string;
  role: string;
};

type MainNavKey = "home" | "post-job" | "for-workers" | "contact" | "";

function initial(email: string) {
  return (email.trim().charAt(0) || "?").toUpperCase();
}

function mainNavClass(active: MainNavKey, key: MainNavKey) {
  return active === key ? "active" : undefined;
}

function DrawerPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

const workerDrawerLinks = [
  { label: "Jobs", href: "/contractors", icon: <BriefcaseIcon /> },
  { label: "Dashboard", href: "/contractors/dashboard", icon: <ChartIcon /> },
  { label: "Chats", href: "/chats", icon: <MessageIcon /> },
];

const adminDrawerLinks = [...workerDrawerLinks, { label: "Admin", href: "/admin", icon: <InboxIcon /> }];

function mainActiveForApp(activeHref: string): MainNavKey {
  if (activeHref === "/post-job") return "post-job";
  if (activeHref.startsWith("/contractors")) return "for-workers";
  return "";
}

export function AccountDrawer({
  open,
  user,
  onClose,
  onLogout,
}: {
  open: boolean;
  user: AccountUser;
  onClose: () => void;
  onLogout: () => void | Promise<void>;
}) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin";
  const isWorker = user.role === "contractor" || isAdmin;
  const roleLinks = isAdmin ? adminDrawerLinks : isWorker ? workerDrawerLinks : [{ label: "Chats", href: "/chats", icon: <MessageIcon /> }];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <DrawerPortal>
      <div className={`lf-drawer-overlay${open ? " open" : ""}`} hidden={!open} onClick={(event) => event.target === event.currentTarget && onClose()}>
        <aside className="lf-drawer" role="dialog" aria-modal="true" aria-label="Account menu">
          <div className="lf-drawer-top">
            <div className="lf-drawer-id">
              <span className="lf-avatar lf-avatar--lg">{initial(user.email)}</span>
              <div className="lf-drawer-idtext">
                <div className="lf-drawer-email" title={user.email}>
                  {user.email}
                </div>
                <span className="lf-drawer-badge">{isAdmin ? "Admin" : isWorker ? "Worker" : "Homeowner"}</span>
              </div>
            </div>
            <button className="lf-drawer-x" type="button" aria-label="Close menu" onClick={onClose}>
              <XIcon />
            </button>
          </div>

          <nav className="lf-drawer-nav">
            {roleLinks.map((link) => (
              <Link key={link.href} className={`lf-drawer-item${pathname === link.href ? " is-active" : ""}`} href={link.href}>
                <span className="lf-di-icon">{link.icon}</span>
                <span className="lf-di-label">{link.label}</span>
                <span className="lf-di-chev">
                  <ChevronRightIcon />
                </span>
              </Link>
            ))}
          </nav>

          <div className="lf-drawer-foot">
            <button className="lf-drawer-logout" type="button" onClick={onLogout}>
              <span className="lf-di-icon">
                <LogoutIcon />
              </span>
              <span>Log out</span>
            </button>
          </div>
        </aside>
      </div>
    </DrawerPortal>
  );
}

export function GuestAccountMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);
  const signupType = pathname === "/for-workers" ? "contractor" : "homeowner";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button className="lf-acct" type="button" aria-haspopup="dialog" aria-expanded={open} aria-label="Profile menu" onClick={() => setOpen(true)}>
        <span className="lf-avatar">
          <UserIcon />
        </span>
        <span className="lf-acct-chev">
          <ChevronDownIcon />
        </span>
      </button>
      <DrawerPortal>
        <div className={`lf-drawer-overlay${open ? " open" : ""}`} hidden={!open} onClick={(event) => event.target === event.currentTarget && setOpen(false)}>
          <aside className="lf-drawer" role="dialog" aria-modal="true" aria-label="Profile menu">
            <div className="lf-drawer-top">
              <div className="lf-drawer-id">
                <span className="lf-avatar lf-avatar--lg">
                  <UserIcon />
                </span>
                <div className="lf-drawer-idtext">
                  <div className="lf-drawer-email">Your account</div>
                  <span className="lf-drawer-badge">Guest</span>
                </div>
              </div>
              <button className="lf-drawer-x" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
                <XIcon />
              </button>
            </div>

            <div className="lf-guest-panel">
              <h2>Log in to Local Fix</h2>
              <p>Post repair jobs, see replies, and manage your worker profile from one place.</p>
              <div className="lf-guest-actions">
                <Link className="lf-guest-primary" href={`/login?next=${next}`}>
                  Log in
                </Link>
                <Link className="lf-guest-secondary" href={`/signup?type=${signupType}&next=${next}`}>
                  Create account
                </Link>
              </div>
            </div>

          </aside>
        </div>
      </DrawerPortal>
    </>
  );
}

export function AccountMenu({ user, onLogout }: { user: AccountUser; onLogout: () => void | Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="lf-acct" type="button" aria-haspopup="dialog" aria-expanded={open} aria-label="Account menu" onClick={() => setOpen(true)}>
        <span className="lf-avatar">{initial(user.email)}</span>
        <span className="lf-acct-chev">
          <ChevronDownIcon />
        </span>
      </button>
      <AccountDrawer open={open} user={user} onClose={() => setOpen(false)} onLogout={onLogout} />
    </>
  );
}

export function AppHeader({
  user,
  onLogout,
  active = "",
}: {
  user: AccountUser;
  onLogout: () => void | Promise<void>;
  active?: MainNavKey;
}) {
  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Local Fix home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src={assetPath("/logos/Localfix-HorzontalLogoNewBLACK.png")} alt="Local Fix" />
        </Link>

        <div className="nav-links">
          <Link href="/" className={mainNavClass(active, "home")}>
            Home
          </Link>
          <Link href="/post-job" className={mainNavClass(active, "post-job")}>
            Post My Problem
          </Link>
          <Link href="/for-workers" className={mainNavClass(active, "for-workers")}>
            For Workers
          </Link>
          <Link href="/contact" className={mainNavClass(active, "contact")}>
            Contact
          </Link>
        </div>

        <div className="nav-cta">
          <span className="nav-auth">
            <AccountMenu user={user} onLogout={onLogout} />
          </span>
        </div>
      </nav>
    </header>
  );
}

export function RoleAppHeader({
  user,
  activeHref,
  onLogout,
}: {
  user: AccountUser;
  activeHref: string;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <AppHeader
      user={user}
      onLogout={onLogout}
      active={mainActiveForApp(activeHref)}
    />
  );
}

export function AppHeaderFallback({
  activeHref,
}: {
  activeHref: string;
}) {
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Local Fix home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src={assetPath("/logos/Localfix-HorzontalLogoNewBLACK.png")} alt="Local Fix" />
        </Link>

        <div className="nav-links">
          <Link href="/" className={mainNavClass(mainActiveForApp(activeHref), "home")}>
            Home
          </Link>
          <Link href="/post-job" className={mainNavClass(mainActiveForApp(activeHref), "post-job")}>
            Post My Problem
          </Link>
          <Link href="/for-workers" className={mainNavClass(mainActiveForApp(activeHref), "for-workers")}>
            For Workers
          </Link>
          <Link href="/contact" className={mainNavClass(mainActiveForApp(activeHref), "contact")}>
            Contact
          </Link>
        </div>

        <div className="nav-cta">
          <span className="nav-auth">
            <Link className="nav-btn nav-login" href={loginHref}>
              Log in
            </Link>
            <GuestAccountMenu />
          </span>
        </div>
      </nav>
    </header>
  );
}
