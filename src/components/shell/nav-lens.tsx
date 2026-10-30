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
    <span
      className={`cs-nav-lens ${raised ? "cs-nav-lens--raised" : ""} ${active ? "is-active" : ""}`}
      style={
        raised
          ? {
              width: "clamp(2.9rem, 16vw, 4rem)",
              height: "clamp(2.9rem, 16vw, 4rem)",
              margin: "0 0 clamp(0.65rem, 2vw, 1.25rem)",
              minWidth: 0,
            }
          : undefined
      }
    >
      <Link
        href={href}
        title={label}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className="cs-nav-lens__disc"
        style={
          raised
            ? {
                borderRadius: 999,
                background: "#ff6b4a",
                color: "#ffffff",
                border: "3px solid #ffffff",
                boxShadow: "0 10px 22px rgba(15, 23, 42, 0.28)",
              }
            : undefined
        }
      >
        <Camera aria-hidden="true" strokeWidth={2} />
      </Link>
    </span>
  );
}
