"use client";

import { useTranslations } from "next-intl";
import { CulturalCalendar } from "@/components/events/cultural-calendar";
import { PageHero } from "@/components/shell/page-hero";

export function EventsIndex() {
  const t = useTranslations("events");

  return (
    <div>
      <PageHero index="03" kicker={t("kicker")} title={t("title")} lede={t("lede")} />
      <div className="mx-auto max-w-[96rem] px-4 py-10 sm:px-5 lg:px-8 lg:py-16">
        <p className="max-w-2xl border-l-2 border-cobalt pl-4 text-sm leading-relaxed text-ink-soft">
          {t("inventoryNote")}
        </p>
        <div className="mt-10">
          <CulturalCalendar host="municipality" />
        </div>
      </div>
    </div>
  );
}
