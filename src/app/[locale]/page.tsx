import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExploreExperience } from "@/components/explore/explore-experience";
import { resolveLocale } from "@/lib/resolve-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "explore" });
  return { title: t("title"), description: t("lede") };
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await resolveLocale(params);
  return <ExploreExperience />;
}
