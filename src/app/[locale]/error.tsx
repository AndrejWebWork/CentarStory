"use client";

import { useTranslations } from "next-intl";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="font-display text-5xl leading-none">{t("errorTitle")}</h1>
      <p className="mt-4 text-ink-soft">{t("errorBody")}</p>
      <button type="button" onClick={reset} className="cs-btn cs-btn-cobalt mt-6">
        {t("tryAgain")}
      </button>
    </div>
  );
}
