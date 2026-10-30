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
      style={raised ? { width: 64, height: 64, margin: "0 0 20px" } : undefined}
    >
      <Link
        href={href}
        title={label}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className="cs-nav-lens__disc"
        style={
          raised
            ? { borderRadius: 999, background: "transparent", boxShadow: "none", color: "#ffffff" }
            : undefined
        }
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
      viewBox="0 0 48 48"
      width="28"
      height="28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.2 17.2h8.4l2.2-4h10.4l2.2 4H34a3.2 3.2 0 0 1 3.2 3.2v9.2A3.2 3.2 0 0 1 34 32.8H6.2A3.2 3.2 0 0 1 3 29.6v-9.2a3.2 3.2 0 0 1 3.2-3.2Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="26.2" cy="28.4" r="7.1" stroke="currentColor" strokeWidth="2.7" />
      <path d="M31.4 33.6 41.6 43.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
