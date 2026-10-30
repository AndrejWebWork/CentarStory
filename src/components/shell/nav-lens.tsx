"use client";

import { Camera } from "lucide-react";
import type { MouseEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { armCamera } from "@/lib/scan/arm-camera";

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
  const router = useRouter();

  function openCamera(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    void armCamera();
    router.push(href);
  }

  return (
    <span
      className={`cs-nav-lens ${raised ? "cs-nav-lens--raised" : ""} ${active ? "is-active" : ""}`}
      style={
        raised
          ? {
              width: "clamp(2.8rem, 15.4vw, 3.85rem)",
              height: "clamp(2.8rem, 15.4vw, 3.85rem)",
              margin: "0 0 clamp(0.4rem, 1.2vw, 0.85rem)",
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
        onClick={(event) => void openCamera(event)}
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
