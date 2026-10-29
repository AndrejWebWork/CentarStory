import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("common");
  return (
    <p className="px-5 py-16 text-sm tracking-[0.18em] text-brass uppercase" role="status">
      {t("loading")}
    </p>
  );
}
