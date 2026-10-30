"use client";

import { Link } from "@/i18n/navigation";

export function NavLens({
  href,
  label,
  active,
  raised = false,
}: {
  href: string;
  label: string;
  active?: boolean;
  raised?: boolean;
}) {
  return (
    <span
      className={`cs-nav-lens ${raised ? "cs-nav-lens--raised" : ""} ${active ? "is-active" : ""}`}
      style={raised ? { width: "3.75rem", height: "3.75rem", margin: "0 0 1.22rem" } : undefined}
    >
      <Link
        href={href}
        title={label}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className="cs-nav-lens__disc"
        style={raised ? { borderRadius: 999, background: "#141820" } : undefined}
      >
        <ScanLensIcon />
      </Link>
    </span>
  );
}

function ScanLensIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1.6" y="6.6" width="14.2" height="11.6" rx="3.1" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.1 6.6L6.4 4.6h5.4l1.3 2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="8.7" cy="12.4" r="3.15" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.7" cy="12.4" r="1.15" fill="currentColor" />
      <circle cx="15.4" cy="15.4" r="4.05" stroke="currentColor" strokeWidth="1.8" />
      <path d="M18.4 18.4L22.2 22.2" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" />
    </svg>
  );
}
