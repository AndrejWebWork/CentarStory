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
        <div className="cs-mast flex h-24 items-center justify-between gap-3 px-4 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-3 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center justify-self-start">
            <span className="font-display text-[1.45rem] leading-none tracking-tight sm:text-3xl">CentarStory</span>
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
          <div className="ml-auto flex shrink-0 items-center justify-self-end lg:ml-0">
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
              height: 84,
              overflow: "visible",
              color: "#141820",
              filter: "drop-shadow(0 16px 36px rgba(15, 23, 42, 0.28))",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-end",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  flex: "1 1 0",
                  height: 58,
                  background: "#141820",
                  borderTopLeftRadius: 999,
                  borderBottomLeftRadius: 999,
                  marginRight: -2,
                }}
              />
              <svg width="180" height="84" viewBox="0 0 180 84" style={{ display: "block", flex: "none" }}>
                <path
                  fill="#141820"
                  d="M0 84L0 26L44.97 26L47.06 25.89L49.12 25.56L51.15 25.02L53.1 24.27L54.97 23.32L56.72 22.18L58.35 20.86L59.83 19.38L61.15 17.76L62.29 16L63.56 13.97L64.98 12.05L66.54 10.23L68.23 8.54L70.05 6.98L71.97 5.56L74 4.29L76.12 3.17L78.31 2.21L80.57 1.42L82.88 0.8L85.23 0.36L87.61 0.09L90 0L92.39 0.09L94.77 0.36L97.12 0.8L99.43 1.42L101.69 2.21L103.88 3.17L106 4.29L108.03 5.56L109.95 6.98L111.77 8.54L113.46 10.23L115.02 12.05L116.44 13.97L117.71 16L118.85 17.76L120.17 19.38L121.65 20.86L123.28 22.18L125.03 23.32L126.9 24.27L128.85 25.02L130.88 25.56L132.94 25.89L135.03 26L180 26L180 84Z"
                />
              </svg>
              <span
                style={{
                  flex: "1 1 0",
                  height: 58,
                  background: "#141820",
                  borderTopRightRadius: 999,
                  borderBottomRightRadius: 999,
                  marginLeft: -2,
                }}
              />
            </div>
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
