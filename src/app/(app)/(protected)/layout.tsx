"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardAuthStore } from "@/lib/dashboardStore";

/**
 * All routes under `(protected)` require a dashboard session (cookie + persisted token).
 * Edge protection: `src/middleware.ts` redirects unauthenticated `/dashboard/*` to `/login`.
 * This layout aligns client state after Zustand rehydration from localStorage.
 */
export default function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = useDashboardAuthStore.persist;
    if (!persistApi) {
      setHydrated(true);
      return;
    }
    if (persistApi.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return persistApi.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken) router.replace("/login");
  }, [hydrated, accessToken, router]);

  if (!hydrated) return null;
  if (!accessToken) return null;

  return <>{children}</>;
}
