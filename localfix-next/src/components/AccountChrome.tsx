"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { type ReactNode, useEffect, useState } from "react";
import {
  BriefcaseIcon,
  CameraIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  InboxIcon,
  LogoutIcon,
  SearchIcon,
  UserIcon,
  WrenchIcon,
  XIcon,
} from "./Icons";
import { assetPath } from "@/lib/paths";

export type AccountUser = {
  email: string;
  role: string;
};

function initial(email: string) {
  return (email.trim().charAt(0) || "?").toUpperCase();
}

function DrawerPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

const siteLinks = [
  { label: "Home", href: "/", icon: <SearchIcon /> },
  { label: "Post My Problem", href: "/post-job", icon: <CameraIcon /> },
  { label: "For Workers", href: "/for-workers", icon: <WrenchIcon /> },
  { label: "Contact", href: "/contact", icon: <ClockIcon /> },
];

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
  const roleLinks = isAdmin
    ? [
        { label: "Admin view (all jobs)", href: "/admin", icon: <InboxIcon /> },
        { label: "Worker view (browse jobs)", href: "/contractors", icon: <BriefcaseIcon /> },
      ]
    : [{ label: "Browse jobs", href: "/contractors", icon: <BriefcaseIcon /> }];
  const links = [...siteLinks, ...roleLinks];

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
              <span className="lf-drawer-badge" hidden={!isAdmin}>
                Admin
              </span>
            </div>
          </div>
          <button className="lf-drawer-x" type="button" aria-label="Close menu" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <nav className="lf-drawer-nav">
          {links.map((link) => (
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
                <Link className="lf-guest-primary" href="/login">
                  Log in
                </Link>
                <Link className="lf-guest-secondary" href="/signup">
                  Create account
                </Link>
              </div>
            </div>

            <nav className="lf-drawer-nav">
              <p className="lf-drawer-section-label">Browse</p>
              {siteLinks.map((link) => (
                <Link key={link.href} className={`lf-drawer-item${pathname === link.href ? " is-active" : ""}`} href={link.href}>
                  <span className="lf-di-icon">{link.icon}</span>
                  <span className="lf-di-label">{link.label}</span>
                  <span className="lf-di-chev">
                    <ChevronRightIcon />
                  </span>
                </Link>
              ))}
            </nav>
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

export function AppHeader({ user, onLogout }: { user: AccountUser; onLogout: () => void | Promise<void> }) {
  return (
    <header className="lf-appbar">
      <div className="lf-appbar-inner">
        <Link className="brand" href="/" aria-label="Local Fix home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src={assetPath("/logos/Localfix-HorzontalLogoNewBLACK.png")} alt="Local Fix" />
        </Link>
        <span className="lf-tag" hidden={user.role !== "admin"}>
          Admin
        </span>
        <span className="lf-appbar-spacer" />
        <AccountMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}
