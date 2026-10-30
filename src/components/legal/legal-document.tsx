import { getTranslations } from "next-intl/server";
import { pick } from "@/content/copy";
import { LEGAL_UPDATED, legalDocuments, type LegalSlug } from "@/content/legal";
import { PageHero } from "@/components/shell/page-hero";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/lib/resolve-locale";

const indexes: Record<LegalSlug, string> = {
  legal: "L1",
  privacy: "L2",
  terms: "L3",
  cookies: "L4",
};

export async function LegalDocumentPage({
  slug,
  params,
}: {
  slug: LegalSlug;
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const document = legalDocuments.find((item) => item.slug === slug);
  if (!document) return null;
  const t = await getTranslations("legal");

  return (
    <article>
      <PageHero
        index={indexes[slug]}
        kicker={pick(document.kicker, locale)}
        title={pick(document.title, locale)}
        lede={pick(document.lede, locale)}
        extra={<p className="mt-4 text-xs text-foam/65">{t("updated", { date: LEGAL_UPDATED })}</p>}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-5 lg:py-16">
        {document.sections.map((section) => (
          <section key={pick(section.heading, locale)} className="mt-10 first:mt-0">
            <h2 className="font-display text-3xl leading-none sm:text-4xl">{pick(section.heading, locale)}</h2>
            {section.body.map((paragraph) => (
              <p key={pick(paragraph, locale).slice(0, 48)} className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
                {pick(paragraph, locale)}
              </p>
            ))}
          </section>
        ))}
        <nav className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6" aria-label={t("kicker")}>
          {legalDocuments.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              aria-current={item.slug === slug ? "page" : undefined}
              className={`cs-btn ${item.slug === slug ? "cs-btn-ink" : "cs-btn-ghost"}`}
            >
              {t(item.slug)}
            </Link>
          ))}
        </nav>
      </div>
    </article>
  );
}
