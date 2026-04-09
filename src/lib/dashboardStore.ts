"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DashboardAuthState = {
  accessToken: string;
  refreshToken: string;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  setAccessToken: (accessToken: string) => void;
  clearTokens: () => void;
};

const AUTH_COOKIE = "lllarik_dashboard_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export const useDashboardAuthStore = create<DashboardAuthState>()(
  persist(
    (set) => ({
      accessToken: "",
      refreshToken: "",
      setTokens: ({ accessToken, refreshToken }) => {
        setAuthCookie(accessToken);
        set({ accessToken, refreshToken });
      },
      setAccessToken: (accessToken) => {
        setAuthCookie(accessToken);
        set({ accessToken });
      },
      clearTokens: () => {
        clearAuthCookie();
        set({ accessToken: "", refreshToken: "" });
      },
    }),
    {
      name: "lllarik-dashboard-auth",
      version: 2,
      migrate: (persistedState, version) => {
        if (version >= 2) return persistedState as DashboardAuthState;
        const legacy = persistedState as { token?: string };
        const accessToken = legacy?.token ?? "";
        return {
          accessToken,
          refreshToken: "",
        } as Partial<DashboardAuthState>;
      },
    },
  ),
);
