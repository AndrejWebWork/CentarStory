"use client";

import { Camera, Compass, Landmark, Signpost, UtensilsCrossed } from "lucide-react";
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

const icons: Record<DestinationId, typeof Compass> = {
  explore: Compass,
  scan: Camera,
  museums: Landmark,
  food: UtensilsCrossed,
  around: Signpost,
};

function labelFor(t: ReturnType<typeof useTranslations>, id: DestinationId) {
  return id === "museums" ? t("explore.museums") : t(`nav.${id}`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const current = activeDestination(pathname);
  const reduce = useReducedMotion();

  return (
    <>
      <a className="skip-link" href="#content">
        {t("common.skip")}
      </a>
      <header className="cs-glass sticky top-0 z-40 border-b border-ink">
        <div className="mx-auto grid h-14 max-w-[96rem] grid-cols-[1fr_auto] items-stretch lg:h-[4.4rem] lg:grid-cols-[auto_1fr_auto_auto]">
          <Link href="/" className="flex items-center gap-4 border-r border-ink px-4 lg:px-7">
            <span className="font-display text-2xl leading-none tracking-tight sm:text-3xl">CentarStory</span>
            <span className="hidden border-l border-line pl-4 text-[10px] tracking-[0.24em] text-brass uppercase sm:block">
              41.9957°N · 21.4312°E
            </span>
          </Link>
          <div className="hidden items-center px-6 text-[10px] tracking-[0.24em] text-ink-soft uppercase xl:flex">
            {t("explore.kicker")} · Skopje
          </div>
          <nav className="hidden items-stretch border-l border-ink lg:flex" aria-label={t("nav.primary")}>
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
                      ? `grid w-16 place-items-center border-r border-ink ${active ? "bg-cobalt text-foam" : "bg-copper text-foam hover:bg-copper-deep"}`
                      : `grid w-16 place-items-center border-r border-ink ${active ? "bg-ink text-foam" : "text-ink hover:bg-paper-2"}`
                  }
                >
                  <Icon className="size-5" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center px-3 lg:px-5">
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
        className={`relative z-[1] overflow-x-clip ${pathname.startsWith("/scan") ? "" : "max-lg:pb-24"}`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
        {pathname.startsWith("/scan") ? null : (
          <footer className="border-t border-ink bg-ink text-foam">
            <div className="mx-auto grid max-w-[96rem] gap-8 px-5 py-12 pb-28 lg:grid-cols-12 lg:px-8 lg:py-20">
              <div className="lg:col-span-5">
                <p className="text-[10px] tracking-[0.26em] text-brass uppercase">
                  OSM Relation 2439777 · Europe/Skopje
                </p>
                <p className="mt-3 font-display text-5xl leading-[0.86] tracking-tight sm:text-7xl">
                  CentarStory
                </p>
                <p className="mt-4">
                  <Link href="/events" className="text-xs tracking-[0.18em] text-brass uppercase underline">
                    {t("nav.events")} →
                  </Link>
                </p>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-foam/75 lg:col-span-6 lg:col-start-7 lg:self-end">
                {t("common.disclaimer")}
              </p>
            </div>
          </footer>
        )}
      </motion.div>
      <nav
        className="cs-dock fixed inset-x-0 bottom-0 z-40 border-t border-foam/20 pb-[env(safe-area-inset-bottom)] lg:hidden"
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
                      className={`-mt-5 flex size-14 items-center justify-center border-2 border-paper ${active ? "bg-cobalt text-foam" : "bg-copper text-foam"}`}
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
                  className={`flex h-full items-center justify-center ${active ? "bg-foam/10 text-paper" : "text-foam/55"}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
