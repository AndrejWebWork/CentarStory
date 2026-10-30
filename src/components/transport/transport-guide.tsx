"use client";

import {
  ArrowLeft,
  BusFront,
  CarTaxiFront,
  ExternalLink,
  Footprints,
  Phone,
  Smartphone,
  Ticket,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { pick } from "@/content/copy";
import { getMedia } from "@/content/knowledge/media";
import { binbin, enjoyTariff, jspHow, wiziTariff } from "@/content/mobility";
import { jspFares, transportLinks } from "@/content/transport";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import type { MediaAsset } from "@/content/knowledge/schema";

type ModeId = "walk" | "bus" | "enjoy" | "binbin" | "taxi";

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
          <Smartphone className="size-4" aria-hidden="true" />
          {playLabel}
        </a>
      ) : null}
      {ios ? (
        <a href={ios} className="cs-btn cs-btn-cobalt" target="_blank" rel="noreferrer">
          <Smartphone className="size-4" aria-hidden="true" />
          {iosLabel}
        </a>
      ) : null}
      {web ? (
        <a href={web} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
          <ExternalLink className="size-4" aria-hidden="true" />
          {webLabel}
        </a>
      ) : null}
    </div>
  );
}

function BrandMark({
  mode,
  large = false,
}: {
  mode: { title: string; icon?: typeof BusFront; logo?: { src: string; wide?: boolean } };
  large?: boolean;
}) {
  if (mode.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mode.logo.src}
        alt=""
        className={
          mode.logo.wide
            ? large
              ? "h-8 w-auto max-w-[8rem] object-contain"
              : "h-7 w-auto max-w-[6.5rem] object-contain"
            : large
              ? "size-14 object-contain"
              : "size-10 object-contain"
        }
      />
    );
  }
  const Icon = mode.icon ?? Footprints;
  return (
    <span className={`grid place-items-center bg-foam/12 ${large ? "size-12" : "size-10"}`}>
      <Icon className={large ? "size-7" : "size-5"} aria-hidden="true" />
    </span>
  );
}

function TilePhoto({ image, alt }: { image?: MediaAsset; alt: string }) {
  if (!image) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaSrc(image, 960)}
      srcSet={mediaSrcSet(image)}
      sizes="(min-width: 1024px) 20vw, 50vw"
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export function TransportGuide() {
  const t = useTranslations("transport");
  const around = useTranslations("around");
  const locale = useLocale();
  const [open, setOpen] = useState<ModeId | null>(null);

  const walkImage = getMedia("img-square-from-bridge");
  const busImage = getMedia("img-jsp-double-vlatko");
  const taxiImage = getMedia("img-skopje-taxis-darlin");

  const modes: Array<{
    id: ModeId;
    title: string;
    icon?: typeof BusFront;
    logo?: { src: string; wide?: boolean };
    image?: MediaAsset;
    wash: string;
  }> = [
    {
      id: "walk",
      title: around("walk"),
      icon: Footprints,
      image: walkImage,
      wash: "from-ink/20 via-ink/45 to-ink",
    },
    {
      id: "bus",
      title: around("bus"),
      icon: BusFront,
      image: busImage,
      wash: "from-cobalt/10 via-ink/50 to-ink",
    },
    {
      id: "enjoy",
      title: around("enjoyTitle"),
      logo: { src: "/brands/e-enjoy-mark.png" },
      wash: "from-[#ff8a4a] via-[#e24b2d] to-[#1a1410]",
    },
    {
      id: "binbin",
      title: around("binbinTitle"),
      logo: { src: "/brands/binbin-white.svg", wide: true },
      wash: "from-[#14b8a6] via-[#0f766e] to-[#0b1f1c]",
    },
    {
      id: "taxi",
      title: around("taxi"),
      icon: CarTaxiFront,
      image: taxiImage,
      wash: "from-brass/20 via-ink/50 to-ink",
    },
  ];

  const active = modes.find((mode) => mode.id === open);

  return (
    <div>
      <header className="bg-ink px-4 py-5 text-foam sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[96rem] items-end justify-between gap-4">
          <div>
            <p className="cs-kicker m-0 text-foam/55">01 — {t("kicker")}</p>
            <h1 className="mt-2 font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-none">{t("title")}</h1>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-foam/65 sm:block">{t("pickHint")}</p>
        </div>
      </header>

      {active ? (
        <section className="mx-auto max-w-[96rem] px-4 py-5 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setOpen(null)} className="cs-btn cs-btn-ghost">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t("back")}
          </button>
          <article className="mt-4 overflow-hidden border border-line bg-foam">
            <div className="relative h-52 bg-ink sm:h-64">
              <TilePhoto
                image={active.image}
                alt={active.image ? pick(active.image.caption, locale) : active.title}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${active.image ? "from-ink via-ink/25 to-transparent" : active.wash}`} />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-foam">
                <div>
                  <p className="text-[10px] tracking-[0.22em] uppercase">{t("open")}</p>
                  <h2 className="mt-1 font-display text-4xl leading-none">{active.title}</h2>
                </div>
                <BrandMark mode={active} large />
              </div>
            </div>
            <div className="p-5 sm:p-8">
              {open === "walk" ? <WalkDetail /> : null}
              {open === "bus" ? <BusDetail /> : null}
              {open === "enjoy" ? <EnjoyDetail /> : null}
              {open === "binbin" ? <BinbinDetail /> : null}
              {open === "taxi" ? <TaxiDetail /> : null}
              {active.image ? (
                <p className="mt-6 text-[11px] tracking-[0.08em] text-brass uppercase">
                  {active.image.credit} · {active.image.license}
                </p>
              ) : null}
            </div>
          </article>
        </section>
      ) : (
        <section className="mx-auto max-w-[96rem] px-4 py-5 sm:px-6 lg:px-8">
          <p className="cs-kicker sm:hidden">
            <Footprints className="size-3.5" aria-hidden="true" />
            {t("pickHint")}
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {modes.map((mode) => {
              return (
                <li key={mode.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(mode.id)}
                    className="group relative block aspect-[4/5] w-full overflow-hidden bg-ink text-left text-foam"
                  >
                    <TilePhoto
                      image={mode.image}
                      alt={mode.image ? pick(mode.image.caption, locale) : mode.title}
                    />
                    <div
                      className={`absolute inset-0 ${
                        mode.image
                          ? `bg-gradient-to-t ${mode.wash}`
                          : `bg-gradient-to-br ${mode.wash}`
                      }`}
                    />
                    <span className="absolute top-3 left-3 grid h-10 place-items-center">
                      <BrandMark mode={mode} />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 p-3">
                      <span className="block text-[10px] tracking-[0.2em] text-foam/70 uppercase">{t("open")}</span>
                      <span className="mt-1 block font-display text-2xl leading-none sm:text-3xl">{mode.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function WalkDetail() {
  const around = useTranslations("around");
  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
        <Footprints className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden="true" />
        {around("walkBody")}
      </p>
    </div>
  );
}

function BusDetail() {
  const t = useTranslations("transport");
  const around = useTranslations("around");
  return (
    <div>
      <p className="cs-kicker">
        <BusFront className="size-3.5" aria-hidden="true" />
        {t("jspTitle")}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{around("busBody")}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{around("busHow")}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{around("busAccount")}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{around("busValidate")}</p>
      <p className="mt-3 text-sm text-copper">{around("busNoLive")}</p>
      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-2">
          <dt className="flex items-center gap-2 text-ink-soft">
            <Phone className="size-3.5" aria-hidden="true" />
            {around("phone")}
          </dt>
          <dd>
            <a href={transportLinks.phone} className="underline">
              {transportLinks.phoneDisplay}
            </a>
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-2">
          <dt className="flex items-center gap-2 text-ink-soft">
            <Phone className="size-3.5" aria-hidden="true" />
            {around("desk")}
          </dt>
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
          <Ticket className="size-4" aria-hidden="true" />
          {around("officialList")}
        </a>
        <a href={jspHow.faq} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
          <ExternalLink className="size-4" aria-hidden="true" />
          {around("faq")}
        </a>
        <a href={jspHow.announcements} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
          <ExternalLink className="size-4" aria-hidden="true" />
          {around("announcements")}
        </a>
      </div>
      <p className="mt-4 text-xs text-ink-soft">{around("fareCaptured", { checked: transportLinks.fareListChecked })}</p>
      <p className="mt-6 text-xs tracking-[0.18em] text-brass uppercase">{around("confirm")}</p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {jspFares.map((fare) => (
          <li key={fare.id} className="flex items-baseline justify-between gap-4 py-3">
            <span className="text-sm text-ink-soft">{around(fare.labelKey)}</span>
            <span className="shrink-0 font-display text-xl leading-none">{fare.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EnjoyDetail() {
  const t = useTranslations("transport");
  const around = useTranslations("around");
  return (
    <div>
      {/* Official e-Enjoy wordmark from enjoyscooters.com */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brands/e-enjoy.png" alt="" className="mb-4 h-12 w-auto max-w-full object-contain object-left" />
      <p className="text-sm leading-relaxed text-ink-soft">{around("enjoyBody")}</p>
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
    </div>
  );
}

function BinbinDetail() {
  const t = useTranslations("transport");
  const around = useTranslations("around");
  return (
    <div>
      {/* Official BinBin wordmark from binbin.tech */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brands/binbin.svg" alt="" className="mb-4 h-8 w-auto object-contain object-left" />
      <p className="text-sm leading-relaxed text-ink-soft">{around("binbinBody")}</p>
      <AppLinks
        play={binbin.playStore}
        ios={binbin.appStore}
        web={binbin.help}
        playLabel={t("googlePlay")}
        iosLabel={t("appStore")}
        webLabel={around("binbinSource")}
      />
    </div>
  );
}

function TaxiDetail() {
  const around = useTranslations("around");
  return (
    <div>
      <p className="text-sm leading-relaxed text-ink-soft">{around("taxiBody")}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{around("wiziBody")}</p>
      <ul className="mt-4 space-y-1 text-sm">
        <li>{around("wiziStart", { amount: wiziTariff.startMkd })}</li>
        <li>{around("wiziKm", { amount: wiziTariff.perKmMkd })}</li>
        <li>{around("wiziWait", { amount: wiziTariff.waitingHourMkd })}</li>
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={wiziTariff.tel} className="cs-btn cs-btn-ink">
          <Phone className="size-4" aria-hidden="true" />
          {wiziTariff.phone}
        </a>
        <a href={wiziTariff.url} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
          <ExternalLink className="size-4" aria-hidden="true" />
          {around("wiziSource")}
        </a>
      </div>
    </div>
  );
}
