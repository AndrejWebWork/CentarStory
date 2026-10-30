"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export function BackLink({
  href,
  onClick,
  children,
  tone = "on-dark",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  tone?: "on-dark" | "on-light";
}) {
  const className = `cs-back cs-back--${tone}`;
  const inner = (
    <>
      <span className="cs-back__mark" aria-hidden="true">
        <ArrowLeft className="size-4" />
      </span>
      <span>{children}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
