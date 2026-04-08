"use client";

import { useCallback } from "react";

export function useMagneticButton<T extends HTMLElement>(strength = 0.3) {
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback((e: React.MouseEvent<T>) => {
    const el = e.currentTarget;
    el.style.transform = "translate(0px, 0px)";
  }, []);

  return { handleMouseMove, handleMouseLeave };
}
