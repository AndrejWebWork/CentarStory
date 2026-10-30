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
        <div className="cs-mast flex items-center justify-between gap-2 px-3 sm:gap-3 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-3 lg:px-8">
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
        className={`relative z-0 overflow-x-clip ${isScan ? "" : "max-lg:pb-36 lg:pb-0"}`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
        {isScan ? null : (
          <footer className="mt-16 bg-ink text-foam">
            <div className="mx-auto max-w-[96rem] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-brass uppercase">
                OSM Relation 2439777 · Europe/Skopje
              </p>
              <p className="mt-3 font-display text-5xl leading-[0.9] tracking-tight sm:text-7xl">CentarStory</p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-foam/65">{t("common.disclaimer")}</p>
              <nav className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-8 sm:grid-cols-5" aria-label={t("nav.primary")}>
                {destinations.map((item) => (
                  <Link key={item.id} href={item.href} className="cs-foot-link">
                    {labelFor(t, item.id)}
                  </Link>
                ))}
              </nav>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6">
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
      {isScan ? null : (
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
                borderRadius: 999,
                background: "#141820",
                pointerEvents: "none",
              }}
            />
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
