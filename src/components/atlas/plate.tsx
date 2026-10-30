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
      className="cs-rule-grid relative min-h-72 overflow-hidden text-foam"
      style={{
        background: `radial-gradient(circle at 78% 18%, ${palette[0]}66, transparent 46%), ${palette[1]}`,
        borderTop: `4px solid ${palette[0]}`,
        color: palette[0],
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-4 select-none font-display text-[9rem] leading-none text-foam/10"
      >
        {index}
      </span>
      <MotifShape motif={motif} color={palette[0]} />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 border-t border-foam/20 bg-ink/85 p-5">
        <div>
          <p className="text-[10px] tracking-[0.24em] text-brass uppercase">{eyebrow}</p>
          <p className="mt-1 font-display text-3xl leading-none">{title}</p>
        </div>
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: palette[0] }} aria-hidden="true" />
      </figcaption>
    </figure>
  );
}

function MotifShape({ motif, color }: { motif: Motif; color: string }) {
  const common = "cs-motif-breathe absolute inset-0 h-full w-full";
  const style = { color, opacity: 0.55 };
  if (motif === "bridge" || motif === "river") {
    return (
      <svg viewBox="0 0 240 180" className={common} style={style} aria-hidden="true">
        <path
          d="M16 118c18-28 28-28 40 0 12-28 24-28 36 0 12-28 24-28 36 0 12-28 24-28 36 0 12-28 22-28 40 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M12 118h216" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (motif === "rider") {
    return (
      <svg viewBox="0 0 240 180" className={common} style={style} aria-hidden="true">
        <path d="M118 28v86" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="118" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M86 112h78" stroke="currentColor" strokeWidth="1.4" />
        <path d="M96 112c8 22 18 28 22 36M140 112c-6 20-14 28-22 36" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (motif === "arch") {
    return (
      <svg viewBox="0 0 240 180" className={common} style={style} aria-hidden="true">
        <path d="M70 140 V58 h100 v82" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M92 140 V84 h56 v56" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (motif === "clock") {
    return (
      <svg viewBox="0 0 240 180" className={common} style={style} aria-hidden="true">
        <circle cx="120" cy="78" r="28" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M120 78 L120 60 M120 78 L134 86" stroke="currentColor" strokeWidth="1.6" />
        <path d="M48 140h144" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (motif === "dome") {
    return (
      <svg viewBox="0 0 240 180" className={common} style={style} aria-hidden="true">
        <path d="M70 130 V78 h100 v52" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M120 78c22 0 34-16 34-32H86c0 16 12 32 34 32Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (motif === "fort") {
    return (
      <svg viewBox="0 0 240 180" className={common} style={style} aria-hidden="true">
        <path d="M40 132 V70 h28 v18 h24 V58 h28 v30 h24 V74 h28 v58" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 180" className={common} style={style} aria-hidden="true">
      <path d="M58 132 V48 h124 v84" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M58 78h124M104 48v84M150 48v84" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
