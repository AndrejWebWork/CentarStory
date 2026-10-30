"use client";

import { BusFront, CalendarDays, Signpost, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
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
    <>
      <a className="skip-link" href="#content">
        {t("common.skip")}
      </a>
      <header className="sticky top-0 z-50 isolate">
        <div className="cs-mast flex h-24 flex-col justify-center gap-1.5 px-4 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center justify-self-start">
            <span className="font-display text-2xl leading-none tracking-tight sm:text-3xl">CentarStory</span>
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
          <div className="flex shrink-0 items-center justify-self-end">
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
        className={`relative z-0 overflow-x-clip ${isScan ? "" : "max-lg:pb-[6.75rem] lg:pb-6"}`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
        {isScan ? null : (
          <footer className="mx-3 mt-10 overflow-hidden bg-ink text-foam lg:mx-4">
            <div className="mx-auto grid max-w-[96rem] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:px-10 lg:py-16">
              <div className="lg:col-span-5">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-brass uppercase">
                  OSM Relation 2439777 · Europe/Skopje
                </p>
                <p className="mt-3 font-display text-5xl leading-[0.92] tracking-tight sm:text-7xl">
                  CentarStory
                </p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-foam/70">{t("common.disclaimer")}</p>
              </div>
              <div className="lg:col-span-6 lg:col-start-7 lg:self-end">
                <p className="cs-kicker text-foam/55">{t("legal.kicker")}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {legalLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="cs-btn cs-btn-ghost border-foam/20 bg-foam/5 text-foam">
                        {t(`legal.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </footer>
        )}
      </motion.div>
      {isScan ? null : (
        <nav
          className="cs-dock fixed inset-x-3 bottom-3 z-50 pb-[env(safe-area-inset-bottom)] lg:hidden"
          aria-label={t("nav.primary")}
        >
          <div
            className="cs-dock__stage mx-auto max-w-lg"
            style={{
              position: "relative",
              height: "5rem",
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
                height: "3.6rem",
                borderRadius: 999,
                background: "#141820",
                pointerEvents: "none",
              }}
            />
            <svg
              className="cs-dock__join"
              viewBox="0 0 120 36"
              width={120}
              height={36}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "50%",
                bottom: "3.6rem",
                width: 120,
                height: 36,
                transform: "translateX(-50%)",
                overflow: "visible",
                color: "#141820",
                pointerEvents: "none",
              }}
            >
              <path
                fill="currentColor"
                d="M0 36h23.06C28 36 31 33.8 33.61 29.71A30 30 0 0 1 86.39 29.71C89.2 33.8 92 36 96.94 36H120H0z"
              />
            </svg>
            <ul
              className="cs-dock__pill"
              style={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                alignItems: "stretch",
                height: "100%",
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
                    className={`flex h-full items-center justify-center ${active ? "text-foam" : "text-foam/45"}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
            </ul>
          </div>
        </nav>
      )}
    </>
  );
}
