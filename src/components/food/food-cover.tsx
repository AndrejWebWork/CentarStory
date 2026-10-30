import { pick } from "@/content/copy";
import { getDish } from "@/content/food";
import { getMedia } from "@/content/knowledge/media";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";

export function coverForDishes(serves: string[], shift = 0) {
  const covers = serves.flatMap((slug) => {
    const dish = getDish(slug);
    if (!dish?.imageId) return [];
    const media = getMedia(dish.imageId);
    return media ? [{ media, palette: dish.palette }] : [];
  });
  if (covers.length > 0) return covers[Math.abs(shift) % covers.length];
  const dish = serves.map((slug) => getDish(slug)).find((item) => item);
  return {
    media: undefined,
    palette: dish?.palette ?? (["#e6d2b8", "#8a4b32"] as [string, string]),
  };
}

export function FoodCover({
  serves,
  locale,
  alt,
  shift = 0,
}: {
  serves: string[];
  locale: string;
  alt: string;
  shift?: number;
}) {
  const cover = coverForDishes(serves, shift);
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(155deg, ${cover.palette[0]}, ${cover.palette[1]})` }}
      />
      {cover.media ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaSrc(cover.media, 800)}
          srcSet={mediaSrcSet(cover.media)}
          sizes="(min-width: 1024px) 24rem, 50vw"
          alt={cover.media.caption ? pick(cover.media.caption, locale) : alt}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : null}
    </>
  );
}
