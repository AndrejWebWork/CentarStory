import { sites } from "@/content/knowledge/catalog";
import { media } from "@/content/knowledge/media";

export type VisionEntry = {
  slug: string;
  names: string[];
  entityType: string;
  visual: string;
  lat: number;
  lng: number;
  hasReferencePhotograph: boolean;
};

export function visionCatalogue(): VisionEntry[] {
  const imageIds = new Set(media.map((item) => item.id));
  return sites.map((site) => {
    const visual = [site.eyebrow.en, site.architecturalStyle?.en, site.architecturalFeatures?.en]
      .filter(Boolean)
      .join(" — ")
      .slice(0, 360);
    return {
      slug: site.slug,
      names: [
        site.officialName.en,
        site.nameMk,
        ...site.alternativeNames,
        ...site.transliterations,
      ],
      entityType: site.entityType,
      visual,
      lat: site.coordinates.lat,
      lng: site.coordinates.lng,
      hasReferencePhotograph: site.images.some((id) => imageIds.has(id)),
    };
  });
}

export function isCatalogueSlug(slug: string) {
  return sites.some((site) => site.slug === slug);
}

export function referenceBindings() {
  return sites.flatMap((site) =>
    site.images.map((imageId) => ({ slug: site.slug, imageId })),
  );
}
