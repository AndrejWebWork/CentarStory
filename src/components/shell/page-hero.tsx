import type { ReactNode } from "react";

export function PageHero({
  index,
  kicker,
  title,
  lede,
  tone = "ink",
  extra,
}: {
  index: string;
  kicker: string;
  title: string;
  lede: string;
  tone?: "ink" | "paper" | "plain";
  extra?: ReactNode;
}) {
  const ink = tone === "ink";
  return (
    <header
      className={`relative mx-3 mt-3 overflow-hidden rounded-[1.75rem] sm:mx-4 ${
        ink
          ? "bg-[linear-gradient(160deg,#0f172a_0%,#1e3a8a_58%,#3b6dff_140%)] text-foam"
          : tone === "paper"
            ? "bg-paper-2 text-ink"
            : "bg-foam text-ink"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-4 right-3 select-none font-display text-[7.5rem] leading-none tracking-tighter sm:-top-8 sm:right-4 sm:text-[16rem] ${
          ink ? "text-foam/[0.08]" : "text-ink/[0.06]"
        }`}
      >
        {index}
      </span>
      <div className="relative mx-auto grid max-w-[96rem] gap-5 px-5 py-10 sm:gap-8 sm:px-6 sm:py-14 lg:grid-cols-12 lg:px-10 lg:py-20">
        <div className="lg:col-span-8">
          <p className={`cs-kicker ${ink ? "text-foam/70" : ""}`}>
            <span className="inline-block size-2 rounded-full bg-cobalt" aria-hidden="true" />
            {index} — {kicker}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.6rem,9vw,5.6rem)] leading-[0.92] tracking-tight">
            {title}
          </h1>
        </div>
        <div className="pt-2 lg:col-span-4 lg:pt-10">
          <p className={`text-sm leading-relaxed sm:text-base ${ink ? "text-foam/78" : "text-ink-soft"}`}>{lede}</p>
          {extra}
        </div>
      </div>
    </header>
  );
}
