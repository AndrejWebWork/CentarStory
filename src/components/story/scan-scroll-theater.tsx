"use client";

import { useLayoutEffect, useRef } from "react";
import { Plate } from "@/components/atlas/plate";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion/gsap-client";
import type { ChronicleFigure, ChronicleRole } from "@/lib/story/chronicle-cast";
import type { FilmKind } from "@/lib/story/cinematic-register";
import { monumentTone } from "@/lib/story/monument-tone";

export function ScanScrollTheater({
  figures,
  lead,
  second,
  scrollLabel,
  kicker,
  roleLabels,
  filmKind,
  year,
  yearShort,
  architecture,
  yearLabel,
  architectureLabel,
  washA: washAProp,
  washB: washBProp,
  accent: accentProp,
}: {
  figures: ChronicleFigure[];
  lead: string;
  second: string;
  scrollLabel: string;
  kicker: string;
  roleLabels: Record<ChronicleRole, string>;
  filmKind: FilmKind;
  year?: string;
  yearShort?: string;
  architecture?: string;
  yearLabel: string;
  architectureLabel: string;
  washA?: string;
  washB?: string;
  accent?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const derived = monumentTone(figures[0]?.slug ?? "chronicle", figures[0]?.motif);
  const washA = washAProp || derived.washA;
  const washB = washBProp || derived.washB;
  const accent = accentProp || derived.accent;
  const showFacts =
    filmKind === "museum" ||
    filmKind === "memorial" ||
    filmKind === "civic" ||
    filmKind === "ottoman" ||
    filmKind === "fortress";

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    registerGsap();

    const cue = section.querySelector("[data-chronicle-cue]");
    const leadEl = section.querySelector("[data-chronicle-lead]");
    const secondEl = section.querySelector("[data-chronicle-second]");
    const cards = section.querySelectorAll<HTMLElement>("[data-chronicle-card]");
    const armyBack = section.querySelector("[data-chronicle-army-back]");
    const armyFront = section.querySelector("[data-chronicle-army-front]");
    const horses = section.querySelectorAll<HTMLElement>("[data-chronicle-horse]");
    const kickerEl = section.querySelector("[data-chronicle-kicker]");
    const ground = section.querySelector("[data-chronicle-ground]");
    const yearEl = section.querySelector("[data-chronicle-year]");
    const wash = section.querySelector("[data-chronicle-wash]");
    const sparks = section.querySelectorAll<HTMLElement>("[data-chronicle-spark]");
    const bobs = section.querySelectorAll<HTMLElement>("[data-chronicle-bob]");

    if (prefersReducedMotion()) {
      gsap.set([cue, leadEl, secondEl, cards, armyBack, armyFront, kickerEl, ground, yearEl, wash, sparks], {
        clearProps: "all",
        autoAlpha: 1,
        x: 0,
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(cue, { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(kickerEl, { autoAlpha: 0, y: 18, letterSpacing: "0.5em" });
      gsap.set(leadEl, { autoAlpha: 0, y: 48, rotate: -2 });
      gsap.set(secondEl, { autoAlpha: 0, y: 36 });
      gsap.set(ground, { autoAlpha: 0, scaleX: 0.2, transformOrigin: "50% 100%" });
      gsap.set(yearEl, { autoAlpha: 0, y: 40, scale: 0.62 });
      gsap.set(wash, { autoAlpha: 0.35, scale: 1.18 });
      gsap.set(armyBack, { autoAlpha: 0, xPercent: 72, y: 36, scale: 0.72 });
      gsap.set(armyFront, { autoAlpha: 0, xPercent: 88, y: 54, scale: 0.58 });
      horses.forEach((horse, index) => {
        gsap.set(horse, {
          y: index % 2 === 0 ? 18 : -14,
          rotate: index % 2 === 0 ? -8 : 9,
          scale: 0.86,
        });
      });
      cards.forEach((card, index) => {
        const fromLeft = card.dataset.side !== "right";
        gsap.set(card, {
          autoAlpha: 0,
          xPercent: fromLeft ? -78 : 78,
          y: 72,
          rotate: fromLeft ? -16 : 16,
          scale: 0.78,
          zIndex: index + 1,
        });
      });
      sparks.forEach((spark, index) => {
        gsap.set(spark, { autoAlpha: 0, y: 20 + (index % 7) * 8, scale: 0.4 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.55,
        },
      });

      tl.to(cue, { autoAlpha: 0, y: 28, scale: 0.9, duration: 0.08 }, 0)
        .to(wash, { autoAlpha: 1, scale: 1, duration: 0.16 }, 0.02)
        .to(kickerEl, { autoAlpha: 1, y: 0, letterSpacing: "0.28em", duration: 0.1 }, 0.04)
        .to(leadEl, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.12 }, 0.06)
        .to(yearEl, { autoAlpha: 1, y: 0, scale: 1.06, duration: 0.14 }, 0.07)
        .to(yearEl, { scale: 1, duration: 0.08 }, 0.2)
        .to(ground, { autoAlpha: 1, scaleX: 1, duration: 0.14 }, 0.1);

      cards.forEach((card, index) => {
        const at = 0.14 + index * 0.1;
        tl.to(card, { autoAlpha: 1, xPercent: 0, y: 0, rotate: 0, scale: 1, duration: 0.12 }, at);
        if (index > 0) {
          const previous = cards[index - 1];
          const keep = previous.dataset.role === "rider" || previous.dataset.role === "warrior";
          tl.to(previous, { autoAlpha: keep ? 0.78 : 0.1, scale: keep ? 0.94 : 0.86, y: keep ? -12 : -28, duration: 0.09 }, at);
        }
      });

      tl.to(leadEl, { autoAlpha: 0, y: -36, duration: 0.08 }, 0.24)
        .to(yearEl, { autoAlpha: 0.28, y: -20, scale: 0.92, duration: 0.12 }, 0.46)
        .to(armyBack, { autoAlpha: 0.55, xPercent: -32, y: -10, scale: 1.08, duration: 0.42 }, 0.18)
        .to(armyFront, { autoAlpha: 1, xPercent: -44, y: 0, scale: 1.18, duration: 0.48 }, 0.22);

      horses.forEach((horse, index) => {
        tl.to(
          horse,
          {
            y: index % 2 === 0 ? -22 : 20,
            rotate: index % 2 === 0 ? 6 : -7,
            scale: 1.08,
            duration: 0.42,
          },
          0.2 + (index % 6) * 0.018,
        );
      });

      sparks.forEach((spark, index) => {
        tl.to(
          spark,
          { autoAlpha: 0.85, y: -40 - (index % 5) * 12, scale: 1.4, duration: 0.36 },
          0.18 + (index % 8) * 0.03,
        );
      });

      tl.to(secondEl, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.68)
        .to(wash, { autoAlpha: 0.72, scale: 1.08, duration: 0.2 }, 0.7)
        .to(cue, { autoAlpha: 0, duration: 0.04 }, 0.9);

      if (bobs.length) {
        gsap.to(bobs, {
          y: -12,
          duration: 1.05,
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.08, from: "random" },
          ease: "sine.inOut",
        });
      }
      if (horses.length) {
        gsap.to(horses, {
          rotate: "+=6",
          duration: 0.72,
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.05, from: "random" },
          ease: "sine.inOut",
        });
      }
      if (sparks.length) {
        gsap.to(sparks, {
          autoAlpha: 0.25,
          scale: 0.6,
          duration: 0.7,
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.06, from: "random" },
          ease: "sine.inOut",
        });
      }
    }, section);

    return () => ctx.revert();
  }, [figures, filmKind, washA, washB, accent]);

  const stretch = Math.max(360, 200 + figures.length * 80);

  return (
    <section
      ref={sectionRef}
      id="chronicle"
      className="relative bg-ink text-foam"
      style={{ height: `${stretch}vh` }}
    >
      <div
        className="cs-chronicle sticky top-0 isolate h-dvh overflow-hidden"
        ref={(node) => {
          if (!node) return;
          node.style.setProperty("--cs-wash-a", washA);
          node.style.setProperty("--cs-wash-b", washB);
          node.style.setProperty("--cs-accent", accent);
        }}
      >
        <div data-chronicle-wash className="cs-chronicle-wash absolute inset-0" />
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={`spark-${index}`}
            className="pointer-events-none absolute z-[6] size-1.5"
            style={{
              left: `${6 + ((index * 17) % 88)}%`,
              top: `${18 + ((index * 11) % 54)}%`,
            }}
            aria-hidden="true"
          >
            <i data-chronicle-spark className="cs-chronicle-spark block size-1.5 rounded-full" />
          </span>
        ))}

        <p
          data-chronicle-kicker
          className="cs-chronicle-ink absolute top-5 left-5 z-20 text-[10px] tracking-[0.28em] uppercase sm:top-8 sm:left-8"
        >
          {kicker}
        </p>

        <div
          data-chronicle-year
          className={
            showFacts && (year || architecture)
              ? "pointer-events-none absolute inset-x-0 top-[16%] z-[25] px-5 sm:top-[12%] sm:px-8"
              : "hidden"
          }
        >
          {yearShort ? (
            <p className="cs-chronicle-year font-display text-[clamp(3.6rem,14vw,9rem)] leading-none">{yearShort}</p>
          ) : null}
          {year ? (
            <p className="mt-3 max-w-3xl text-[10px] tracking-[0.22em] text-brass uppercase">{yearLabel} · {year}</p>
          ) : null}
          {architecture ? (
            <p className="mt-4 max-w-2xl font-display text-[clamp(1.2rem,3vw,2rem)] leading-[1.05]">
              <span className="cs-chronicle-ink block text-[10px] tracking-[0.22em] uppercase">{architectureLabel}</span>
              <span className="mt-2 block">{architecture}</span>
            </p>
          ) : null}
        </div>

        <div className="absolute inset-0 z-[5]">
          {figures.map((figure) => (
            <article
              key={figure.slug}
              data-chronicle-card
              data-side={figure.side}
              data-role={figure.role}
              className={`cs-chronicle-card absolute w-[62vw] max-w-sm overflow-hidden bg-ink sm:w-[34vw] sm:max-w-md ${
                figure.side === "left"
                  ? showFacts
                    ? "top-[48%] left-[4%] sm:top-[46%] sm:left-[7%]"
                    : "top-[14%] left-[4%] sm:top-[13%] sm:left-[7%]"
                  : showFacts
                    ? "top-[54%] right-[4%] sm:top-[50%] sm:right-[7%]"
                    : "top-[22%] right-[4%] sm:top-[16%] sm:right-[7%]"
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                {figure.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaSrc(figure.image, 960)}
                    srcSet={mediaSrcSet(figure.image)}
                    sizes="40vw"
                    alt={figure.imageAlt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Plate
                    motif={figure.motif}
                    palette={figure.palette}
                    index={figure.role === "rider" ? "01" : "02"}
                    title={figure.name}
                    eyebrow={figure.eyebrow}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
              </div>
              <div className="border-t border-foam/15 px-4 py-3">
                <p className="cs-chronicle-ink text-[10px] tracking-[0.2em] uppercase">{roleLabels[figure.role]}</p>
                <h3 className="mt-1 font-display text-2xl leading-none sm:text-3xl">{figure.name}</h3>
                <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-foam/70">{figure.explanation}</p>
              </div>
            </article>
          ))}
        </div>

        <div
          data-chronicle-ground
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[38%] bg-gradient-to-t from-black/55 via-black/10 to-transparent"
          aria-hidden="true"
        >
          <div className="absolute inset-x-[8%] bottom-[34%] h-px bg-[var(--cs-accent)] opacity-50" />
        </div>

        <div
          data-chronicle-army-back
          className="cs-chronicle-army pointer-events-none absolute inset-x-[-20%] bottom-[18%] z-20 flex items-end gap-6 opacity-55 sm:bottom-[16%] sm:gap-12"
          aria-hidden="true"
        >
          {Array.from({ length: 10 }, (_, index) => (
            <span key={`back-${index}`} data-chronicle-bob className="inline-flex">
              <FilmMark kind={filmKind} size="back" flip={index % 3 === 0} />
            </span>
          ))}
        </div>

        <div
          data-chronicle-army-front
          className="cs-chronicle-army pointer-events-none absolute inset-x-[-28%] bottom-[6%] z-30 flex items-end gap-8 sm:bottom-[5%] sm:gap-14"
          aria-hidden="true"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <span key={`front-${index}`} data-chronicle-bob className="inline-flex">
              <FilmMark kind={filmKind} size="front" flip={index % 2 === 1} />
            </span>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[14%] z-20 max-h-[30vh] overflow-hidden px-5 sm:top-[10%] sm:px-8">
          <p
            data-chronicle-lead
            className={`mx-auto max-w-4xl font-display text-[clamp(1.4rem,4vw,2.6rem)] leading-[0.96] line-clamp-4 ${showFacts ? "sr-only" : ""}`}
          >
            {lead}
          </p>
          <p
            data-chronicle-second
            className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-foam/75 line-clamp-4 sm:text-base"
          >
            {second}
          </p>
        </div>

        <p
          data-chronicle-cue
          className="cs-scroll-cue pointer-events-none absolute bottom-28 left-1/2 z-40 -translate-x-1/2 text-[10px] tracking-[0.32em] text-foam/80 uppercase lg:bottom-10"
        >
          {scrollLabel}
        </p>
      </div>
    </section>
  );
}

function FilmMark({ kind, size, flip }: { kind: FilmKind; size: "back" | "front"; flip?: boolean }) {
  if (kind === "cavalry") return <HorseMark flip={flip} size={size} />;
  if (kind === "company") return <WarriorMark size={size} />;
  if (kind === "memorial") return <MemorialMark size={size} />;
  if (kind === "ottoman") return <DomeMark size={size} />;
  if (kind === "fortress") return <FortMark size={size} />;
  return <ColumnMark size={size} />;
}

function HorseMark({ flip, size }: { flip?: boolean; size: "back" | "front" }) {
  const tall = size === "front";
  return (
    <svg
      data-chronicle-horse
      viewBox="0 0 220 140"
      className={`shrink-0 ${tall ? "h-[26vh] w-[42vh] sm:h-[32vh] sm:w-[52vh]" : "h-[16vh] w-[26vh] sm:h-[20vh] sm:w-[32vh]"} ${flip ? "-scale-x-100" : ""}`}
    >
      <ellipse cx="96" cy="78" rx="46" ry="20" fill="currentColor" />
      <path fill="currentColor" d="M132 72c16-22 36-34 58-32l4 10c-18 2-32 14-40 30l-22-8Z" />
      <path fill="currentColor" d="M186 42c8-2 16 2 18 10-8 2-14 2-20-2l2-8Z" />
      <path fill="currentColor" d="M176 40l6-14 8 12-14 2Z" />
      <path fill="currentColor" d="M48 74c-16 8-26 24-22 40 8-12 16-20 26-26l-4-14Z" />
      <path fill="currentColor" d="M62 96c2 14 2 28 0 36h12l6-36H62Zm22 2c2 14 4 28 2 34h12l4-34H84Z" />
      <path fill="currentColor" d="M118 98c2 14 2 26 0 32h12l6-32h-18Zm22 4c4 12 6 24 4 30h12l2-30h-18Z" />
      <circle cx="112" cy="30" r="9" fill="currentColor" />
      <path fill="currentColor" d="M102 40h20l6 30-28 2 2-32Z" />
      <path fill="currentColor" d="M122 44c10-8 22-16 34-18 1 5 0 9-4 12-8 6-18 12-26 20h-4Z" />
    </svg>
  );
}

function WarriorMark({ size }: { size: "back" | "front" }) {
  const tall = size === "front";
  return (
    <svg
      data-chronicle-horse
      viewBox="0 0 72 140"
      className={`shrink-0 ${tall ? "h-[24vh] w-[13vh] sm:h-[30vh] sm:w-[16vh]" : "h-[15vh] w-[8vh] sm:h-[19vh] sm:w-[10vh]"}`}
    >
      <circle cx="30" cy="16" r="10" fill="currentColor" />
      <path fill="currentColor" d="M18 30h26l4 36H16l2-36Z" />
      <path fill="currentColor" d="M16 66h12l-2 56H8Zm22 0h12l12 56H50Z" />
      <path fill="currentColor" d="M44 18h6v78h-6z" />
      <path fill="currentColor" d="M46 14h22v5H46z" />
      <path fill="currentColor" d="M6 40h16v10H6z" />
    </svg>
  );
}

function ColumnMark({ size }: { size: "back" | "front" }) {
  const tall = size === "front";
  return (
    <svg
      data-chronicle-horse
      viewBox="0 0 48 140"
      className={`shrink-0 ${tall ? "h-[24vh] w-[9vh] sm:h-[30vh] sm:w-[11vh]" : "h-[15vh] w-[6vh] sm:h-[19vh] sm:w-[8vh]"}`}
    >
      <path fill="currentColor" d="M8 12h32l-4 10H12L8 12Zm6 12h20v96H14Z" />
      <path fill="currentColor" d="M6 120h36v8H6Z" />
    </svg>
  );
}

function MemorialMark({ size }: { size: "back" | "front" }) {
  const tall = size === "front";
  return (
    <svg
      data-chronicle-horse
      viewBox="0 0 40 120"
      className={`shrink-0 ${tall ? "h-[20vh] w-[7vh] sm:h-[26vh] sm:w-[9vh]" : "h-[13vh] w-[5vh] sm:h-[17vh] sm:w-[6vh]"}`}
    >
      <path fill="currentColor" d="M18 8h4v96h-4z" />
      <circle cx="20" cy="8" r="6" fill="currentColor" />
    </svg>
  );
}

function DomeMark({ size }: { size: "back" | "front" }) {
  const tall = size === "front";
  return (
    <svg
      data-chronicle-horse
      viewBox="0 0 90 120"
      className={`shrink-0 ${tall ? "h-[22vh] w-[17vh] sm:h-[28vh] sm:w-[21vh]" : "h-[14vh] w-[11vh] sm:h-[18vh] sm:w-[14vh]"}`}
    >
      <path fill="currentColor" d="M18 58a18 18 0 1 1 36 0H18Zm28-6a14 14 0 1 1 28 0H46Z" />
      <path fill="currentColor" d="M16 58h68v8H16Zm4 8h16v40H20Zm22 0h16v40H42Zm22 0h16v40H64Z" />
      <path fill="currentColor" d="M12 106h66v8H12Z" />
    </svg>
  );
}

function FortMark({ size }: { size: "back" | "front" }) {
  const tall = size === "front";
  return (
    <svg
      data-chronicle-horse
      viewBox="0 0 80 120"
      className={`shrink-0 ${tall ? "h-[22vh] w-[15vh] sm:h-[28vh] sm:w-[19vh]" : "h-[14vh] w-[10vh] sm:h-[18vh] sm:w-[13vh]"}`}
    >
      <path fill="currentColor" d="M8 28h12v12H8Zm18 0h12v12H26Zm18 0h12v12H44Zm18 0h12v12H62Z" />
      <path fill="currentColor" d="M8 40h64v68H8Z" />
      <path fill="currentColor" d="M4 108h72v8H4Z" />
    </svg>
  );
}
