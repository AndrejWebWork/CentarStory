import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="font-display text-5xl leading-none">{t("notFoundTitle")}</h1>
      <p className="mt-4 text-ink-soft">{t("notFoundBody")}</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center text-copper">
        {t("home")}
      </Link>
    </div>
  );
}
