import { getTranslations } from "next-intl/server";
import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { getMedia } from "@/content/knowledge/media";
import { getSource } from "@/content/knowledge/sources";
import type { ClaimKind } from "@/content/knowledge/schema";

const kindKey: Record<ClaimKind, "fact" | "legend" | "interpretation" | "unverified"> = {
  "documented-fact": "fact",
  "legend-folklore": "legend",
  interpretation: "interpretation",
  unverified: "unverified",
};

export async function Evidence({ slug, locale }: { slug: string; locale: string }) {
  const site = getSite(slug);
  if (!site) return null;
  const t = await getTranslations("evidence");
  const images = site.images.flatMap((id) => {
    const asset = getMedia(id);
    return asset ? [asset] : [];
  });
  const sourceIds = [
    ...new Set(
      [
        site.coordinateSourceId,
        ...site.claims.flatMap((claim) => claim.sourceIds),
        ...site.myths.flatMap((claim) => claim.sourceIds),
        ...site.milestones.flatMap((item) => item.sourceIds),
      ].filter(Boolean),
    ),
  ];
  const registry = sourceIds.flatMap((id) => {
    const source = getSource(id);
    return source ? [source] : [];
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 pb-10 lg:px-8">
      {site.municipality === "nearby" && site.nearbyNote ? (
        <p className="border border-line bg-paper-2 px-4 py-3 text-sm">{pick(site.nearbyNote, locale)}</p>
      ) : null}
      {site.boundaryNote ? <p className="text-sm text-ink-soft">{pick(site.boundaryNote, locale)}</p> : null}
      {images.length > 0 ? (
        <section>
          <h2 className="font-display text-3xl">{t("images")}</h2>
          <ul className="mt-4 grid gap-6 lg:grid-cols-2">
            {images.map((image) => (
              <li key={image.id} className="border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={pick(image.caption, locale)} className="aspect-[16/9] w-full object-cover" />
                <p className="px-4 pt-3 text-sm">{pick(image.caption, locale)}</p>
                <p className="px-4 pb-4 text-xs text-ink-soft">
                  {image.credit} · {image.license}
                  {image.attributionRequired ? ` · ${t("attribution")}` : ""} ·{" "}
                  <a href={image.pageUrl} target="_blank" rel="noreferrer" className="text-copper">
                    {t("source")}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {site.visitor ? (
        <section>
          <h2 className="font-display text-3xl">{t("visitor")}</h2>
          <div className="mt-4 max-w-2xl space-y-2 text-sm leading-relaxed">
            {site.visitor.hours ? <p>{pick(site.visitor.hours, locale)}</p> : null}
            {site.visitor.tickets ? <p>{pick(site.visitor.tickets, locale)}</p> : null}
            {site.visitor.notes ? <p className="text-ink-soft">{pick(site.visitor.notes, locale)}</p> : null}
            {site.visitor.phone ? <p>{site.visitor.phone}</p> : null}
            {site.visitor.website ? (
              <p>
                <a href={site.visitor.website} className="text-copper" target="_blank" rel="noreferrer">
                  {site.visitor.website}
                </a>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
      {site.architecturalFeatures ? (
        <section>
          <h2 className="font-display text-3xl">{t("architecture")}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed">{pick(site.architecturalFeatures, locale)}</p>
          {site.creator ? <p className="mt-3 max-w-2xl text-sm text-ink-soft">{pick(site.creator, locale)}</p> : null}
        </section>
      ) : null}
      {site.milestones.length > 0 ? (
        <section>
          <h2 className="font-display text-3xl">{t("timeline")}</h2>
          <ol className="mt-4 divide-y divide-line border-y border-line">
            {site.milestones.map((item) => (
              <li key={item.id} className="grid gap-2 py-4 sm:grid-cols-12">
                <p className="text-sm text-brass sm:col-span-3">{item.date}</p>
                <p className="text-sm leading-relaxed sm:col-span-9">{pick(item.label, locale)}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <section>
        <h2 className="font-display text-3xl">{t("claims")}</h2>
        <ul className="mt-4 space-y-4">
          {[...site.claims, ...site.myths].map((claim) => (
            <li key={claim.id} className="border border-line p-4">
              <p className="text-[11px] tracking-[0.16em] text-brass uppercase">{t(kindKey[claim.kind])}</p>
              <p className="mt-2 text-sm leading-relaxed">{pick(claim.text, locale)}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-3xl">{t("sources")}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t("sourcesNote")}</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {registry.map((source) => (
            <li key={source.id} className="py-3 text-sm">
              <p className="font-medium">{source.title}</p>
              <p className="text-ink-soft">
                {source.publisher} · {t("accessed")} {source.accessed}
              </p>
              {source.url ? (
                <a href={source.url} className="text-copper" target="_blank" rel="noreferrer">
                  {source.url}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-soft">
          {t("verified")} {site.lastChecked} · {t(site.verificationStatus)}
        </p>
      </section>
    </div>
  );
}
