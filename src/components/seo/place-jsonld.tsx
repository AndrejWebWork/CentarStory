import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { getMedia } from "@/content/knowledge/media";
import { sitePath } from "@/content/places";
import type { Place } from "@/content/types";
import { intlTag } from "@/lib/format";
import { localeHref } from "@/lib/seo/site";

export function PlaceJsonLd({ place, locale }: { place: Place; locale: string }) {
  const site = getSite(place.slug);
  const media = site?.images[0] ? getMedia(site.images[0]) : undefined;
  const kind =
    place.institution === "stage"
      ? "PerformingArtsTheater"
      : place.institution === "collection"
        ? "Museum"
        : "TouristAttraction";
  const data = {
    "@context": "https://schema.org",
    "@type": kind,
    name: pick(place.name, locale),
    description: pick(place.summary, locale),
    url: localeHref(locale, sitePath(place)),
    inLanguage: intlTag(locale),
    address: {
      "@type": "PostalAddress",
      streetAddress: pick(place.address, locale),
      addressLocality: "Skopje",
      addressRegion: "Centar",
      addressCountry: "MK",
    },
    geo: site
      ? {
          "@type": "GeoCoordinates",
          latitude: site.coordinates.lat,
          longitude: site.coordinates.lng,
        }
      : undefined,
    image: media?.url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
