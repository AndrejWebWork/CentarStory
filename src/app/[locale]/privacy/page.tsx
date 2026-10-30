import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocumentPage } from "@/components/legal/legal-document";
import { resolveLocale } from "@/lib/resolve-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("privacy"), description: t("privacyLede") };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  return <LegalDocumentPage slug="privacy" params={params} />;
}
