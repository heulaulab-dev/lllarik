"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DashboardAuthState = {
  token: string;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useDashboardAuthStore = create<DashboardAuthState>()(
  persist(
    (set) => ({
      token: "",
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: "" }),
    }),
    { name: "lllarik-dashboard-auth" },
  ),
);
