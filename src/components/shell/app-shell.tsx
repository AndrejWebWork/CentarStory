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
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 lg:h-20 lg:px-8">
          <Link href="/" className="min-w-0">
            <span className="block font-display text-[1.65rem] leading-none tracking-tight">
              CentarStory
            </span>
            <span className="mt-1 hidden text-[10px] tracking-[0.2em] text-brass uppercase sm:block">
              Centar · Skopje
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label={t("nav.primary")}>
            {destinations.map((item) => {
              const active = current === item.id;
              const emphasis = "emphasis" in item && item.emphasis;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    emphasis
                      ? `inline-flex h-11 items-center gap-2 bg-ink px-4 text-[11px] tracking-[0.18em] text-foam uppercase ${active ? "bg-copper" : ""}`
                      : `inline-flex h-11 items-center px-3 text-[12px] tracking-[0.14em] uppercase ${active ? "text-copper" : "text-ink-soft"}`
                  }
                >
                  {emphasis ? <Camera className="size-4" aria-hidden="true" /> : null}
                  {t(`nav.${item.id}`)}
                </Link>
              );
            })}
          </nav>
          <Suspense fallback={<span className="inline-block h-11 w-28" />}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      </header>
      <motion.div
        key={pathname}
        id="content"
        tabIndex={-1}
        className="relative z-[1]"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
        <footer className="mx-auto max-w-6xl px-5 pt-16 pb-32 lg:px-8 lg:pb-16">
          <p className="font-display text-3xl">CentarStory</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{t("common.disclaimer")}</p>
        </footer>
      </motion.div>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label={t("nav.primary")}
      >
        <ul className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-5">
          {mobileDestinations.map((item) => {
            const Icon = icons[item.id];
            const active = current === item.id;
            const emphasis = "emphasis" in item && item.emphasis;
            if (emphasis) {
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-full flex-col items-center justify-end pb-2 ${active ? "text-copper" : "text-foam"}`}
                  >
                    <span className="-mt-8 mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-foam ring-4 ring-paper">
                      <Camera className="size-5" aria-hidden="true" />
                    </span>
                    <span className="max-w-[4.5rem] text-center text-[10px] leading-tight tracking-normal text-ink">
                      {t("nav.scan")}
                    </span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 px-1 text-[10px] leading-tight tracking-normal ${active ? "text-copper" : "text-ink-soft"}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="text-center">{t(`nav.${item.id}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
