"use client";

import { useRef, useCallback } from "react";

export function useMagneticButton<T extends HTMLElement>(strength = 0.3) {
  const elementRef = useRef<T | null>(null);

  const ref = useCallback((node: T | null) => {
    elementRef.current = node;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = elementRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
