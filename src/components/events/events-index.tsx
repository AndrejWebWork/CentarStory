"use client";

import { Landmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { CulturalCalendar } from "@/components/events/cultural-calendar";
import { PageHero } from "@/components/shell/page-hero";
import { Link } from "@/i18n/navigation";

export function EventsIndex() {
  const t = useTranslations("events");
  const explore = useTranslations("explore");

  return (
    <div>
      <PageHero
        index="06"
        kicker={t("kicker")}
        title={t("title")}
        lede={t("lede")}
        extra={
          <Link href="/museums" className="cs-btn mt-5 w-full bg-foam text-ink sm:w-auto">
            <Landmark className="size-4" aria-hidden="true" />
            {explore("museums")}
          </Link>
        }
      />
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
