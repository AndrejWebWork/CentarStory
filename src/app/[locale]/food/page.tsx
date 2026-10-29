import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FoodGuide } from "@/components/food/food-guide";
import { resolveLocale } from "@/lib/resolve-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "food" });
  return { title: t("title"), description: t("lede") };
}

export default async function FoodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await resolveLocale(params);
  return <FoodGuide />;
}
