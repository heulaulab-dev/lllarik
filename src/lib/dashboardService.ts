"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardAuthStore } from "@/lib/dashboardStore";
import { apiRequest } from "@/lib/http/client";
import { normalizeApiError } from "@/lib/http/errors";
import { notifyApiError } from "@/lib/http/notify";

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

export type DashboardMe = {
  userId: string;
  email: string;
  name: string;
  role: string;
};

export type DashboardUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export function useDashboardMe() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["dashboard-me", accessToken],
    queryFn: () => apiRequest<DashboardMe>({ url: "/api/v1/auth/me" }),
    enabled: !!accessToken,
  });
}

export function useDashboardUsers() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["dashboard-me", accessToken],
    queryFn: () => apiRequest<DashboardMe>({ url: "/api/v1/auth/me" }),
    enabled: !!accessToken,
  });

  const usersQuery = useQuery({
    queryKey: ["dashboard-users", accessToken],
    queryFn: () => apiRequest<{ items: DashboardUserRow[] }>({ url: "/api/v1/users" }),
    enabled: !!accessToken && meQuery.data?.role === "admin",
  });

  const createAdmin = useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      apiRequest<DashboardUserRow>({
        url: "/api/v1/users",
        method: "POST",
        data: payload,
      }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-users"] }),
  });

  const setActive = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) =>
      apiRequest<DashboardUserRow>({
        url: `/api/v1/users/${payload.id}`,
        method: "PATCH",
        data: { isActive: payload.isActive },
      }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-users"] }),
  });

  return {
    users: usersQuery.data?.items ?? [],
    isLoading: usersQuery.isLoading,
    createAdmin,
    setActive,
  };
}

export function useDashboardOverview() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const releases = useQuery({
    queryKey: ["dashboard-releases"],
    queryFn: () => apiRequest<{ items: Array<{ id: string; releasedAt: string }> }>({ url: "/api/v1/releases" }),
    enabled: !!accessToken,
  });
  const products = useQuery({
    queryKey: ["dashboard-products-draft-count"],
    queryFn: () => apiRequest<{ items: unknown[] }>({ url: "/api/v1/content/products?state=draft" }),
    enabled: !!accessToken,
  });
  const copy = useQuery({
    queryKey: ["dashboard-copy-draft-count"],
    queryFn: () => apiRequest<{ items: unknown[] }>({ url: "/api/v1/content/copy?state=draft" }),
    enabled: !!accessToken,
  });

  return {
    lastRelease: releases.data?.items?.[0],
    draftProductsCount: products.data?.items?.length ?? 0,
    draftCopyCount: copy.data?.items?.length ?? 0,
    isLoading: releases.isLoading || products.isLoading || copy.isLoading,
  };
}

export function useDashboardProducts() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["dashboard-products", accessToken],
    queryFn: () => apiRequest<{ items: DashboardProduct[] }>({ url: "/api/v1/content/products?state=draft" }),
    enabled: !!accessToken,
  });

  const createProduct = useMutation({
    mutationFn: (payload: DashboardProduct) =>
      apiRequest({ url: "/api/v1/content/products", method: "POST", data: payload }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-products"] }),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DashboardProduct }) =>
      apiRequest({ url: `/api/v1/content/products/${id}/draft`, method: "PUT", data: payload }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
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
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const copyQuery = useQuery({
    queryKey: ["dashboard-copy", accessToken],
    queryFn: () => apiRequest<{ items: CopyItem[] }>({ url: "/api/v1/content/copy?state=draft" }),
    enabled: !!accessToken,
  });

  const updateCopy = useMutation({
    mutationFn: (payload: CopyItem) =>
      apiRequest({
        url: `/api/v1/content/copy/${encodeURIComponent(payload.key)}/draft`,
        method: "PUT",
        data: { group: payload.group, value: payload.value },
      }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-copy"] }),
  });

  return {
    copyItems: copyQuery.data?.items ?? [],
    isLoading: copyQuery.isLoading,
    updateCopy,
  };
}

export function useDashboardReleases() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const releasesQuery = useQuery({
    queryKey: ["dashboard-releases", accessToken],
    queryFn: () => apiRequest<{ items: Array<{ id: string; releasedAt: string; note?: string }> }>({ url: "/api/v1/releases" }),
    enabled: !!accessToken,
  });

  const publish = useMutation({
    mutationFn: (note: string) => apiRequest({ url: "/api/v1/publish", method: "POST", data: { note } }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
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
  const setTokens = useDashboardAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      apiRequest<{ accessToken: string; refreshToken: string }>({
        url: "/api/v1/auth/login",
        method: "POST",
        data: payload,
      }),
    onSuccess: (data) => setTokens(data),
    onError: (error) => notifyApiError(normalizeApiError(error)),
  });
}

export function useDashboardLogout() {
  const refreshToken = useDashboardAuthStore((s) => s.refreshToken);
  const clearTokens = useDashboardAuthStore((s) => s.clearTokens);

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) return;
      await apiRequest({ url: "/api/v1/auth/logout", method: "POST", data: { refreshToken } });
    },
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSettled: () => {
      clearTokens();
    },
  });
}
