import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TransportGuide } from "@/components/transport/transport-guide";
import { resolveLocale } from "@/lib/resolve-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "transport" });
  return { title: t("title"), description: t("lede") };
}

export default async function TransportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await resolveLocale(params);
  return <TransportGuide />;
}
