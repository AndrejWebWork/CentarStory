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
      className={`relative overflow-hidden border-b border-ink ${
        ink ? "bg-ink text-foam" : tone === "paper" ? "bg-paper-2 text-ink" : "bg-paper text-ink"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-4 right-3 select-none font-display text-[7.5rem] leading-none tracking-tighter sm:-top-8 sm:right-4 sm:text-[16rem] ${
          ink ? "text-foam/[0.06]" : "text-ink/[0.06]"
        }`}
      >
        {index}
      </span>
      <div className="relative mx-auto grid max-w-[96rem] gap-5 px-4 py-9 sm:gap-8 sm:px-5 sm:py-14 lg:grid-cols-12 lg:px-8 lg:py-20">
        <div className="lg:col-span-8">
          <p className={`cs-kicker ${ink ? "text-brass" : ""}`}>
            <span className="inline-block h-2 w-2 bg-cobalt" aria-hidden="true" />
            {index} — {kicker}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.85rem,11vw,6.2rem)] leading-[0.86] tracking-tight">
            {title}
          </h1>
        </div>
        <div className="border-t border-current/20 pt-4 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-2 lg:pl-7">
          <p className={`text-sm leading-relaxed sm:text-base ${ink ? "text-foam/78" : "text-ink-soft"}`}>{lede}</p>
          {extra}
        </div>
      </div>
    </header>
  );
}
