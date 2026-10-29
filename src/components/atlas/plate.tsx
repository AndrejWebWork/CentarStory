import type { Motif } from "@/content/types";

export function Plate({
  motif,
  palette,
  index,
  title,
  eyebrow,
}: {
  motif: Motif;
  palette: [string, string];
  index: string;
  title: string;
  eyebrow: string;
}) {
  return (
    <figure
      className="relative min-h-72 overflow-hidden border border-line"
      style={{
        background: `linear-gradient(165deg, ${palette[0]} 0%, ${palette[1]} 140%)`,
      }}
    >
      <MotifShape motif={motif} />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-ink">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase">{eyebrow}</p>
          <p className="mt-1 font-display text-3xl leading-none">{title}</p>
        </div>
        <p className="font-display text-4xl leading-none text-ink/35">{index}</p>
      </figcaption>
    </figure>
  );
}

function MotifShape({ motif }: { motif: Motif }) {
  const common = "absolute inset-0 h-full w-full text-ink/30";
  if (motif === "bridge" || motif === "river") {
    return (
      <svg viewBox="0 0 240 180" className={common} aria-hidden="true">
        <path
          d="M16 118c18-28 28-28 40 0 12-28 24-28 36 0 12-28 24-28 36 0 12-28 24-28 36 0 12-28 22-28 40 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M12 118h216" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (motif === "rider") {
    return (
      <svg viewBox="0 0 240 180" className={common} aria-hidden="true">
        <path d="M118 28v86" stroke="currentColor" strokeWidth="2" />
        <circle cx="118" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M86 112h78" stroke="currentColor" strokeWidth="1.5" />
        <path d="M96 112c8 22 18 28 22 36M140 112c-6 20-14 28-22 36" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (motif === "arch") {
    return (
      <svg viewBox="0 0 240 180" className={common} aria-hidden="true">
        <path d="M70 140 V62 h100 v78" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M92 140 V86 h56 v54" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (motif === "clock") {
    return (
      <svg viewBox="0 0 240 180" className={common} aria-hidden="true">
        <circle cx="120" cy="78" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M120 78 L120 60 M120 78 L134 86" stroke="currentColor" strokeWidth="1.6" />
        <path d="M48 140h144" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (motif === "dome") {
    return (
      <svg viewBox="0 0 240 180" className={common} aria-hidden="true">
        <path d="M70 130 V78 h100 v52" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M120 78c22 0 34-16 34-32H86c0 16 12 32 34 32Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (motif === "fort") {
    return (
      <svg viewBox="0 0 240 180" className={common} aria-hidden="true">
        <path d="M40 132 V70 h28 v18 h24 V58 h28 v30 h24 V74 h28 v58" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 180" className={common} aria-hidden="true">
      <path d="M58 132 V48 h124 v84" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M58 78h124M104 48v84M150 48v84" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
