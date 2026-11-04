"use client";

import { BusFront, CalendarDays, Signpost, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { CookieNotice } from "@/components/shell/cookie-notice";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { NavLens } from "@/components/shell/nav-lens";
import {
  activeDestination,
  destinations,
  mobileDestinations,
  type DestinationId,
} from "@/components/shell/nav";

const icons: Record<Exclude<DestinationId, "scan">, typeof BusFront> = {
  transport: BusFront,
  events: CalendarDays,
  food: UtensilsCrossed,
  around: Signpost,
};

const legalLinks = [
  { href: "/legal", key: "legal" },
  { href: "/privacy", key: "privacy" },
  { href: "/terms", key: "terms" },
  { href: "/cookies", key: "cookies" },
  { href: "/impressum", key: "impressum" },
] as const;

function labelFor(t: ReturnType<typeof useTranslations>, id: DestinationId) {
  return t(`nav.${id}`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const current = activeDestination(pathname);
  const reduce = useReducedMotion();
  const isScan = pathname.startsWith("/scan");
  const leftDesktop = destinations.filter((item) => item.id !== "scan" && item.id !== "food" && item.id !== "around");
  const rightDesktop = destinations.filter((item) => item.id === "food" || item.id === "around");
  const scanHref = destinations.find((item) => item.id === "scan")?.href ?? "/scan";

  return (
    <div className="flex min-h-dvh flex-col">
      <a className="skip-link" href="#content">
        {t("common.skip")}
      </a>
      <header className="sticky top-0 z-50 isolate lg:px-4 lg:pt-3">
        <div className="cs-mast mx-auto flex items-center justify-between gap-2 px-3 sm:gap-3 sm:px-5 lg:grid lg:h-16 lg:max-w-[96rem] lg:grid-cols-[1fr_auto_1fr] lg:gap-3 lg:px-5">
          <Link href="/" className="flex min-w-0 items-center justify-self-start">
            <span className="cs-brand font-display leading-none tracking-tight">CentarStory</span>
          </Link>
          <nav className="hidden items-center lg:flex" aria-label={t("nav.primary")}>
            {leftDesktop.map((item) => {
              const name = labelFor(t, item.id);
              const Icon = icons[item.id];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={current === item.id ? "page" : undefined}
                  className="cs-nav-link"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {name}
                </Link>
              );
            })}
            <NavLens href={scanHref} label={labelFor(t, "scan")} active={current === "scan"} />
            {rightDesktop.map((item) => {
              const name = labelFor(t, item.id);
              const Icon = icons[item.id];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={current === item.id ? "page" : undefined}
                  className="cs-nav-link"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {name}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex min-w-0 items-center justify-self-end lg:ml-0">
            <Suspense fallback={<span className="inline-block h-9 w-24" />}>
              <LanguageSwitcher />
            </Suspense>
          </div>
        </div>
      </header>
      <motion.div
        key={pathname}
        id="content"
        tabIndex={-1}
        className="relative z-0 flex flex-1 flex-col overflow-x-clip"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex-1">{children}</div>
        {isScan ? null : (
          <footer className="mt-6 bg-ink text-foam max-lg:pb-[5.65rem]">
            <div className="mx-auto max-w-[96rem] px-5 pt-8 pb-4 sm:px-8 lg:px-10 lg:pt-10 lg:pb-5">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)] lg:items-end">
                <div>
                  <p className="font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl">CentarStory</p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-foam/78">{t("common.disclaimer")}</p>
                </div>
                <address className="text-sm leading-relaxed text-foam/80 not-italic">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-brass uppercase">{t("common.contactTitle")}</p>
                  <p className="mt-3">{t("common.contactAddress")}</p>
                  <p className="mt-2">
                    <a className="cs-foot-link" href="tel:+38923203693">
                      +389 2 3203 693
                    </a>
                    <span className="text-foam/40"> · </span>
                    <a className="cs-foot-link" href="tel:+38923203600">
                      +389 2 3203 600
                    </a>
                  </p>
                  <p className="mt-1">
                    <a className="cs-foot-link" href="mailto:kontakt@centar.gov.mk">
                      kontakt@centar.gov.mk
                    </a>
                  </p>
                  <p className="mt-2">
                    <a className="cs-foot-link" href="https://www.centar.gov.mk/kontakt" target="_blank" rel="noreferrer">
                      {t("common.contactPage")}
                    </a>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-foam/50">{t("common.contactNote")}</p>
                </address>
              </div>
              <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-3" aria-label={t("nav.primary")}>
                {destinations.map((item) => (
                  <Link key={item.id} href={item.href} className="cs-foot-link">
                    {labelFor(t, item.id)}
                  </Link>
                ))}
              </nav>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-3">
                {legalLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="cs-foot-link text-foam/55">
                      {t(`legal.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </footer>
        )}
      </motion.div>
      <nav
          className="cs-dock fixed inset-x-3 bottom-3 z-50 pb-[env(safe-area-inset-bottom)] lg:hidden"
          aria-label={t("nav.primary")}
        >
          <div
            className="cs-dock__stage mx-auto max-w-lg"
            style={{
              position: "relative",
              width: "100%",
              overflow: "visible",
              color: "#141820",
              filter: "drop-shadow(0 16px 36px rgba(15, 23, 42, 0.28))",
            }}
          >
            <span
              className="cs-dock__bar"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 58,
                display: "flex",
                pointerEvents: "none",
              }}
            >
              <span style={{ flex: 1, background: "#141820", borderRadius: "999px 0 0 999px" }} />
              <svg width="128" height="58" viewBox="0 0 128 58" style={{ display: "block", flex: "none" }}>
                <path
                  fill="#141820"
                  d="M0 0H37A35 35 0 1 1 91 0H128V58H0Z"
                />
              </svg>
              <span style={{ flex: 1, background: "#141820", borderRadius: "0 999px 999px 0" }} />
            </span>
            <ul
              className="cs-dock__pill"
              style={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                alignItems: "stretch",
                height: "100%",
                minWidth: 0,
                overflow: "visible",
                background: "transparent",
              }}
            >
            {mobileDestinations.map((item) => {
              const name = labelFor(t, item.id);
              if (item.id === "scan") {
                return (
                  <li
                    key={item.id}
                    className="cs-dock__lens-slot"
                    style={{
                      position: "relative",
                      zIndex: 2,
                      display: "flex",
                      height: "100%",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <NavLens href={scanHref} label={name} active={current === "scan"} raised />
                  </li>
                );
              }
              const Icon = icons[item.id];
              const active = current === item.id;
              return (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: "1.4rem",
                  }}
                >
                  <Link
                    href={item.href}
                    title={name}
                    aria-label={name}
                    aria-current={active ? "page" : undefined}
                    className={`cs-dock__link ${active ? "is-active" : ""}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
            </ul>
          </div>
        </nav>
      <CookieNotice />
    </div>
  );
}
