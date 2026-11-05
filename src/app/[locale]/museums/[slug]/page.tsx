import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteStory } from "@/components/story/site-story";
import { PlaceJsonLd } from "@/components/seo/place-jsonld";
import { pick } from "@/content/copy";
import { getPlace, institutions, sitePath } from "@/content/places";
import { locales } from "@/i18n/locales";
import { intlTag } from "@/lib/format";
import { resolveLocale } from "@/lib/resolve-locale";
import { languageAlternates, localeHref } from "@/lib/seo/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    institutions().map((place) => ({ locale, slug: place.slug })),
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
  if (!place?.institution) return { title: "CentarStory" };
  const title = pick(place.name, locale);
  const description = pick(place.summary, locale);
  const path = sitePath(place);
  return {
    title,
    description,
    alternates: { canonical: localeHref(locale, path), languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url: localeHref(locale, path),
      type: "article",
      locale: intlTag(locale).replace("-", "_"),
      siteName: "CentarStory",
    },
  };
}

export default async function MuseumPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;
  const locale = await resolveLocale(params);
  const place = getPlace(slug);
  if (!place?.institution) notFound();
  return (
    <>
      <PlaceJsonLd place={place} locale={locale} />
      <SiteStory place={place} locale={locale} cinematic={from === "scan"} />
    </>
  );
}
