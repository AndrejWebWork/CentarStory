import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AroundGuide } from "@/components/around/around-guide";
import { resolveLocale } from "@/lib/resolve-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "around" });
  return { title: t("title"), description: t("lede") };
}

export default async function AroundPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await resolveLocale(params);
  return <AroundGuide />;
}
