"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardAuthStore } from "@/lib/dashboardStore";

export type DashboardProduct = {
  id?: string;
  productId?: string;
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  imageUrl: string;
  slug?: string;
  sortOrder?: number;
};

export type CopyItem = {
  key: string;
  group: string;
  value: string;
};

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
};

const getBaseUrl = () => process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim() ?? "http://localhost:8080";

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "request failed");
  }
  return response.json() as Promise<T>;
}

export function useDashboardOverview() {
  const token = useDashboardAuthStore((s) => s.token);
  const releases = useQuery({
    queryKey: ["dashboard-releases"],
    queryFn: () => apiFetch<{ items: Array<{ id: string; releasedAt: string }> }>("/api/v1/releases", { token }),
    enabled: !!token,
  });
  const products = useQuery({
    queryKey: ["dashboard-products-draft-count"],
    queryFn: () => apiFetch<{ items: unknown[] }>("/api/v1/content/products?state=draft", { token }),
    enabled: !!token,
  });
  const copy = useQuery({
    queryKey: ["dashboard-copy-draft-count"],
    queryFn: () => apiFetch<{ items: unknown[] }>("/api/v1/content/copy?state=draft", { token }),
    enabled: !!token,
  });

  return {
    lastRelease: releases.data?.items?.[0],
    draftProductsCount: products.data?.items?.length ?? 0,
    draftCopyCount: copy.data?.items?.length ?? 0,
    isLoading: releases.isLoading || products.isLoading || copy.isLoading,
  };
}

export function useDashboardProducts() {
  const token = useDashboardAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["dashboard-products", token],
    queryFn: () => apiFetch<{ items: DashboardProduct[] }>("/api/v1/content/products?state=draft", { token }),
    enabled: !!token,
  });

  const createProduct = useMutation({
    mutationFn: (payload: DashboardProduct) =>
      apiFetch("/api/v1/content/products", { method: "POST", token, body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-products"] }),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DashboardProduct }) =>
      apiFetch(`/api/v1/content/products/${id}/draft`, { method: "PUT", token, body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-products"] }),
  });

  return {
    products: productsQuery.data?.items ?? [],
    isLoading: productsQuery.isLoading,
    createProduct,
    updateProduct,
  };
}

export function useDashboardCopy() {
  const token = useDashboardAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const copyQuery = useQuery({
    queryKey: ["dashboard-copy", token],
    queryFn: () => apiFetch<{ items: CopyItem[] }>("/api/v1/content/copy?state=draft", { token }),
    enabled: !!token,
  });

  const updateCopy = useMutation({
    mutationFn: (payload: CopyItem) =>
      apiFetch(`/api/v1/content/copy/${encodeURIComponent(payload.key)}/draft`, {
        method: "PUT",
        token,
        body: { group: payload.group, value: payload.value },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-copy"] }),
  });

  return {
    copyItems: copyQuery.data?.items ?? [],
    isLoading: copyQuery.isLoading,
    updateCopy,
  };
}

export function useDashboardReleases() {
  const token = useDashboardAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const releasesQuery = useQuery({
    queryKey: ["dashboard-releases", token],
    queryFn: () => apiFetch<{ items: Array<{ id: string; releasedAt: string; note?: string }> }>("/api/v1/releases", { token }),
    enabled: !!token,
  });

  const publish = useMutation({
    mutationFn: (note: string) => apiFetch("/api/v1/publish", { method: "POST", token, body: { note } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-releases"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-copy"] });
    },
  });

  return {
    releases: releasesQuery.data?.items ?? [],
    isLoading: releasesQuery.isLoading,
    publish,
  };
}

export function useDashboardLogin() {
  const setToken = useDashboardAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      apiFetch<{ token: string }>("/api/v1/auth/login", { method: "POST", body: payload }),
    onSuccess: (data) => setToken(data.token),
  });
}
