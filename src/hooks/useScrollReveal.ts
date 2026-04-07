"use client";

import { useEffect, useRef } from "react";

type Direction = "up" | "left" | "right" | "fade";

export function useScrollReveal<T extends HTMLElement>(
  direction: Direction = "up",
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const hiddenClass =
      direction === "left"
        ? "scroll-hidden-left"
        : direction === "right"
          ? "scroll-hidden-right"
          : "scroll-hidden";

    const visibleClass =
      direction === "left" || direction === "right"
        ? "scroll-visible-x"
        : "scroll-visible";

    el.classList.add(hiddenClass);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(visibleClass);
          el.classList.remove(hiddenClass);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, options]);

  return ref;
}
