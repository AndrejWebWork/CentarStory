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
  return { title: t("legal"), description: t("legalLede") };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  return <LegalDocumentPage slug="legal" params={params} />;
}
