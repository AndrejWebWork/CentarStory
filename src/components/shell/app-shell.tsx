"use client";

import { BusFront, CalendarDays, Camera, Signpost, UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import {
  activeDestination,
  destinations,
  mobileDestinations,
  type DestinationId,
} from "@/components/shell/nav";

const icons: Record<DestinationId, typeof BusFront> = {
  transport: BusFront,
  scan: Camera,
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

  return (
    <>
      <a className="skip-link" href="#content">
        {t("common.skip")}
      </a>
      <header className="sticky top-0 z-50 isolate bg-paper/80 px-3 pt-3 pb-2 sm:px-4">
        <div className="cs-glass mx-auto flex h-14 max-w-[96rem] items-center justify-between rounded-2xl border border-line px-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] lg:h-16 lg:px-5">
          <Link href="/" className="flex min-w-0 shrink items-center gap-3 px-2">
            <span className="font-display text-xl leading-none tracking-tight sm:text-2xl">CentarStory</span>
            <span className="hidden text-[10px] font-semibold tracking-[0.16em] text-brass uppercase xl:block">
              41.9957°N · 21.4312°E
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label={t("nav.primary")}>
            {destinations.map((item) => {
              const Icon = icons[item.id];
              const active = current === item.id;
              const emphasis = "emphasis" in item && item.emphasis;
              const name = labelFor(t, item.id);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={name}
                  aria-label={name}
                  aria-current={active ? "page" : undefined}
                  className={
                    emphasis
                      ? `grid size-12 place-items-center rounded-full shadow-md ${active ? "bg-cobalt text-foam" : "bg-copper text-foam hover:bg-copper-deep"}`
                      : `grid size-10 place-items-center rounded-full ${active ? "bg-ink text-foam" : "text-ink hover:bg-paper-2"}`
                  }
                >
                  <Icon className="size-5" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center">
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
          <footer className="mx-3 mt-8 overflow-hidden rounded-[1.75rem] bg-ink text-foam lg:mx-4">
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
          <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
            {mobileDestinations.map((item) => {
              const Icon = icons[item.id];
              const active = current === item.id;
              const emphasis = "emphasis" in item && item.emphasis;
              const name = labelFor(t, item.id);
              if (emphasis) {
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      title={name}
                      aria-label={name}
                      aria-current={active ? "page" : undefined}
                      className="flex h-full items-center justify-center"
                    >
                      <span
                        className={`-mt-5 flex size-14 items-center justify-center rounded-full border-4 border-paper shadow-lg ${active ? "bg-cobalt text-foam" : "bg-copper text-foam"}`}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    title={name}
                    aria-label={name}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-full items-center justify-center ${active ? "text-paper" : "text-foam/50"}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
