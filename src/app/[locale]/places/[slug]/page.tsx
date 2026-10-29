import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteStory } from "@/components/story/site-story";
import { pick } from "@/content/copy";
import { getPlace, places } from "@/content/places";
import { locales } from "@/i18n/locales";
import { resolveLocale } from "@/lib/resolve-locale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    places.filter((place) => !place.institution).map((place) => ({ locale, slug: place.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const place = getPlace(slug);
  if (!place || place.institution) return { title: "CentarStory" };
  return { title: pick(place.name, locale), description: pick(place.summary, locale) };
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const place = getPlace(slug);
  if (!place || place.institution) notFound();
  return <SiteStory place={place} locale={locale} />;
}
