import { BusFront, Footprints, Smartphone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/shell/page-hero";
import { binbin, enjoyTariff, jspHow } from "@/content/mobility";
import { jspFares, transportLinks } from "@/content/transport";

function AppLinks({
  play,
  ios,
  web,
  playLabel,
  iosLabel,
  webLabel,
}: {
  play?: string;
  ios?: string;
  web?: string;
  playLabel: string;
  iosLabel: string;
  webLabel: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {play ? (
        <a href={play} className="cs-btn cs-btn-ink" target="_blank" rel="noreferrer">
          {playLabel}
        </a>
      ) : null}
      {ios ? (
        <a href={ios} className="cs-btn cs-btn-cobalt" target="_blank" rel="noreferrer">
          {iosLabel}
        </a>
      ) : null}
      {web ? (
        <a href={web} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
          {webLabel}
        </a>
      ) : null}
    </div>
  );
}

export async function TransportGuide() {
  const t = await getTranslations("transport");
  const around = await getTranslations("around");

  return (
    <div>
      <PageHero index="01" kicker={t("kicker")} title={t("title")} lede={t("lede")} />

      <div className="mx-auto max-w-[96rem] px-4 py-8 sm:px-5 sm:py-12 lg:px-8">
        <p className="cs-kicker">
          <span className="inline-block size-2 rounded-full bg-cobalt" aria-hidden="true" />
          {around("modes")}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["walk", around("walk"), around("walkBody")],
            ["bus", around("bus"), around("busBody")],
            ["scooter", around("scooter"), around("scooterIntro")],
            ["taxi", around("taxi"), around("taxiBody")],
          ].map(([id, title, body]) => (
            <article key={id} className="rounded-[1.5rem] border border-line bg-foam p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6">
              <h2 className="font-display text-3xl leading-none">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
            </article>
          ))}
        </div>

        <section className="mt-12 overflow-hidden rounded-[1.75rem] border border-line bg-foam shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="grid gap-0 lg:grid-cols-12">
            <div className="border-b border-line p-5 sm:p-8 lg:col-span-5 lg:border-r lg:border-b-0">
              <p className="cs-kicker">
                <BusFront className="size-3.5" aria-hidden="true" />
                {t("jspTitle")}
              </p>
              <h2 className="mt-3 font-display text-4xl leading-[0.9] sm:text-5xl">{around("bus")}</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{around("busHow")}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{around("busAccount")}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{around("busValidate")}</p>
              <p className="mt-3 text-sm text-copper">{around("busNoLive")}</p>
              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-2">
                  <dt className="text-ink-soft">{around("phone")}</dt>
                  <dd>
                    <a href={transportLinks.phone} className="underline">
                      {transportLinks.phoneDisplay}
                    </a>
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-2">
                  <dt className="text-ink-soft">{around("desk")}</dt>
                  <dd>
                    <a href={transportLinks.desk} className="underline">
                      {transportLinks.deskDisplay}
                    </a>
                  </dd>
                </div>
              </dl>
              <AppLinks
                play={jspHow.playStore}
                web={transportLinks.planner}
                playLabel={t("googlePlay")}
                iosLabel={t("appStore")}
                webLabel={around("planner")}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={transportLinks.priceList} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
                  {around("officialList")}
                </a>
                <a href={jspHow.faq} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
                  {around("faq")}
                </a>
                <a href={jspHow.announcements} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
                  {around("announcements")}
                </a>
              </div>
              <p className="mt-4 text-xs text-ink-soft">
                {around("fareCaptured", { checked: transportLinks.fareListChecked })}
              </p>
            </div>
            <div className="p-5 sm:p-8 lg:col-span-7">
              <p className="text-xs tracking-[0.18em] text-brass uppercase">{around("confirm")}</p>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {jspFares.map((fare) => (
                  <li key={fare.id} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="text-sm text-ink-soft">{around(fare.labelKey)}</span>
                    <span className="shrink-0 font-display text-xl leading-none">{fare.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <p className="cs-kicker">
            <Smartphone className="size-3.5" aria-hidden="true" />
            {t("apps")}
          </p>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <article className="rounded-3xl border border-line bg-paper p-5 sm:p-8">
              <h2 className="font-display text-4xl leading-none">{around("enjoyTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{around("enjoyBody")}</p>
              <ul className="mt-4 space-y-1 text-sm">
                <li>{around("enjoyStart", { amount: enjoyTariff.startMkd })}</li>
                <li>{around("enjoyMinute", { amount: enjoyTariff.perMinuteMkd })}</li>
                <li>{around("enjoyReserve", { amount: enjoyTariff.reservationPer10MinMkd })}</li>
                <li>{around("enjoyPause", { amount: enjoyTariff.pausePerMinuteMkd })}</li>
              </ul>
              <AppLinks
                play={enjoyTariff.playStore}
                ios={enjoyTariff.appStore}
                web={enjoyTariff.url}
                playLabel={t("googlePlay")}
                iosLabel={t("appStore")}
                webLabel={around("enjoySource")}
              />
            </article>
            <article className="rounded-3xl border border-line bg-paper p-5 sm:p-8">
              <h2 className="font-display text-4xl leading-none">{around("binbinTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{around("binbinBody")}</p>
              <AppLinks
                play={binbin.playStore}
                ios={binbin.appStore}
                web={binbin.help}
                playLabel={t("googlePlay")}
                iosLabel={t("appStore")}
                webLabel={around("binbinSource")}
              />
            </article>
          </div>
        </section>

        <p className="mt-10 flex items-start gap-2 text-sm text-ink-soft">
          <Footprints className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden="true" />
          {around("walkBody")}
        </p>
      </div>
    </div>
  );
}
