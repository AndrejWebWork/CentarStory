"use client";

import { Camera } from "lucide-react";
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
    <span className={`cs-nav-lens ${raised ? "cs-nav-lens--raised" : ""} ${active ? "is-active" : ""}`}>
      <i className="cs-nav-fillet cs-nav-fillet--tl" aria-hidden="true" />
      <i className="cs-nav-fillet cs-nav-fillet--bl" aria-hidden="true" />
      <i className="cs-nav-fillet cs-nav-fillet--tr" aria-hidden="true" />
      <i className="cs-nav-fillet cs-nav-fillet--br" aria-hidden="true" />
      <Link
        href={href}
        title={label}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className="cs-nav-lens__disc"
      >
        <Camera className="size-5" aria-hidden="true" />
      </Link>
    </span>
  );
}
