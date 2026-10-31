"use client";

import {
  AudioLines,
  BookOpenCheck,
  ChevronDown,
  Command,
  Code2,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  ScanSearch,
  Settings2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/accesslens", label: "AccessLens AI", icon: ScanSearch, primary: true },
  { href: "/skillbridge", label: "SkillBridge AI", icon: BookOpenCheck },
  { href: "/supportpilot", label: "SupportPilot AI", icon: LifeBuoy },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="workspace">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar" aria-label="Main sidebar">
        <Link className="brand" href="/" aria-label="AccessBridge AI home">
          <span className="brand-mark" aria-hidden="true">
            <AudioLines size={21} strokeWidth={2.2} />
          </span>
          <span className="brand-name">
            AccessBridge<span>AI</span>
          </span>
        </Link>

        <div className="workspace-switcher">
          <span className="workspace-avatar" aria-hidden="true">
            AB
          </span>
          <span className="workspace-switcher-copy">
            <strong>Personal workspace</strong>
            <span>Free plan</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </div>

        <nav className="primary-navigation" aria-label="Main navigation">
          <p className="nav-label">WORKSPACE</p>
          {navigation.map(({ href, label, icon: Icon, primary }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`nav-link${active ? " active" : ""}${primary ? " nav-primary" : ""}`}
                onClick={() => setMobileNavOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
                {primary && <span className="nav-dot" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon" aria-hidden="true">
              <Command size={17} />
            </span>
            <div>
              <strong>Built for a better web</strong>
              <span>Small fixes, lasting impact.</span>
            </div>
          </div>
          <div className="sidebar-project-link">
            <Code2 size={15} aria-hidden="true" />
            <span>GitHub source not linked</span>
          </div>
          <div className="profile-row">
            <span className="profile-avatar" aria-hidden="true">
              Y
            </span>
            <span className="profile-copy">
              <strong>Your workspace</strong>
              <span>Local session</span>
            </span>
            <Link
              href="/settings"
              className="icon-button profile-menu-button"
              aria-label="Open settings"
            >
              <Settings2 size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="mobile-header">
        <Link className="brand" href="/" aria-label="AccessBridge AI home">
          <span className="brand-mark" aria-hidden="true">
            <AudioLines size={20} strokeWidth={2.2} />
          </span>
          <span className="brand-name">
            AccessBridge<span>AI</span>
          </span>
        </Link>
        <button
          type="button"
          className="icon-button mobile-menu-button"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!mobileNavOpen}
      >
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={`nav-link${pathname === href ? " active" : ""}`}
            onClick={() => setMobileNavOpen(false)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <main id="main-content" className="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
