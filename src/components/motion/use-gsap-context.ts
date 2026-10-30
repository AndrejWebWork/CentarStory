"use client";

import { useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion/gsap-client";

export function useGsapContext(
  scope: RefObject<HTMLElement | null>,
  factory: () => void,
  deps: DependencyList = [],
) {
  useLayoutEffect(() => {
    registerGsap();
    if (!scope.current || prefersReducedMotion()) return;
    const ctx = gsap.context(factory, scope);
    return () => ctx.revert();
    // factory is recreated when deps change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
