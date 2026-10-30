"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion/gsap-client";
import type { SkeletonMesh } from "@/lib/recognition/skeleton";

export function SkeletonOverlay({
  mesh,
  active,
  locked,
  failed,
  delay = 0,
}: {
  mesh: SkeletonMesh | null;
  active: boolean;
  locked: boolean;
  failed: boolean;
  delay?: number;
}) {
  const rootRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !mesh || !active) return;
    registerGsap();

    const dots = root.querySelectorAll<SVGCircleElement>("[data-bone-dot]");
    const bones = root.querySelectorAll<SVGLineElement>("[data-bone-line]");
    const sweep = root.querySelector<SVGRectElement>("[data-bone-sweep]");
    const sortedDots = [...dots].sort(
      (a, b) => Number(a.getAttribute("cy") ?? 0) - Number(b.getAttribute("cy") ?? 0),
    );
    const sortedBones = [...bones].sort(
      (a, b) =>
        Math.min(Number(a.getAttribute("y1") ?? 0), Number(a.getAttribute("y2") ?? 0)) -
        Math.min(Number(b.getAttribute("y1") ?? 0), Number(b.getAttribute("y2") ?? 0)),
    );

    if (prefersReducedMotion()) {
      gsap.set([sortedDots, sortedBones, sweep], { clearProps: "all", autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(sortedDots, { attr: { r: 0 }, autoAlpha: 1 });
      gsap.set(sweep, { autoAlpha: 0.9, y: 0 });
      for (const line of sortedBones) {
        const length = Math.max(1, hypotLength(line));
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length, autoAlpha: 1 });
      }

      gsap
        .timeline({ delay, defaults: { ease: "power2.out" } })
        .to(sweep, { y: mesh.height, duration: 1.15, ease: "none" }, 0)
        .to(sortedDots, { attr: { r: 1.15 }, duration: 0.22, stagger: 0.012 }, 0.06)
        .to(sortedBones, { strokeDashoffset: 0, duration: 0.48, stagger: 0.01, ease: "power2.inOut" }, 0.28)
        .to(sweep, { autoAlpha: 0, duration: 0.28 }, "-=0.15");
    }, root);

    return () => ctx.revert();
  }, [active, delay, mesh]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !mesh || !active || prefersReducedMotion()) return;
    registerGsap();
    const dots = root.querySelectorAll("[data-bone-dot]");
    const bones = root.querySelectorAll("[data-bone-line]");

    if (locked) {
      const tween = gsap.fromTo(
        dots,
        { attr: { r: 1.15 } },
        { attr: { r: 1.9 }, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut", delay: delay + 0.9 },
      );
      return () => {
        tween.kill();
      };
    }

    if (failed) {
      const tween = gsap.to([dots, bones], { autoAlpha: 0.16, duration: 0.4, delay: 0.35 });
      return () => {
        tween.kill();
      };
    }
  }, [active, delay, failed, locked, mesh]);

  if (!mesh || !active) return null;

  const stroke = Math.max(0.4, Math.min(mesh.width, mesh.height) * 0.0045);

  return (
    <svg
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full mix-blend-screen"
      viewBox={`0 0 ${mesh.width} ${mesh.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width={mesh.width} height={mesh.height} fill="rgba(8,12,24,0.28)" />
      {mesh.edges.map((edge) => {
        const from = mesh.points[edge.a];
        const to = mesh.points[edge.b];
        if (!from || !to) return null;
        return (
          <line
            key={`${edge.a}-${edge.b}`}
            data-bone-line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#ffffff"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        );
      })}
      {mesh.points.map((point, index) => (
        <circle
          key={`${point.x}-${point.y}-${index}`}
          data-bone-dot
          cx={point.x}
          cy={point.y}
          r={1.15}
          fill="#ffffff"
        />
      ))}
      <rect data-bone-sweep width={mesh.width} height={1.2} fill="#ffffff" opacity={0.85} />
    </svg>
  );
}

function hypotLength(line: SVGLineElement) {
  const x1 = Number(line.getAttribute("x1") ?? 0);
  const y1 = Number(line.getAttribute("y1") ?? 0);
  const x2 = Number(line.getAttribute("x2") ?? 0);
  const y2 = Number(line.getAttribute("y2") ?? 0);
  return Math.hypot(x2 - x1, y2 - y1);
}
