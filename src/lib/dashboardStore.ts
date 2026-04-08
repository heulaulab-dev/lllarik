"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DashboardAuthState = {
  token: string;
  setToken: (token: string) => void;
  clearToken: () => void;
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
      token: "",
      setToken: (token) => {
        setAuthCookie(token);
        set({ token });
      },
      clearToken: () => {
        clearAuthCookie();
        set({ token: "" });
      },
    }),
    { name: "lllarik-dashboard-auth" },
  ),
);
