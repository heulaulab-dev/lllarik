"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardAuthStore } from "@/lib/dashboardStore";
import { apiRequest } from "@/lib/http/client";
import { normalizeApiError } from "@/lib/http/errors";
import { notifyApiError } from "@/lib/http/notify";

export type DashboardProduct = {
  id?: string;
  productId?: string;
  seriesId?: string;
  state?: string;
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  images?: string[];
  imageUrl: string;
  slug?: string;
  sortOrder?: number;
};

export type DashboardSeriesDraftSlice = {
  name: string;
  versionId: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  images: string[];
  imageUrl: string;
};

export type DashboardSeriesListItem = {
  seriesId: string;
  slug: string;
  sortOrder: number;
  productCount: number;
  draft: DashboardSeriesDraftSlice | null;
  published: DashboardSeriesDraftSlice | null;
};

export type DashboardSeriesForm = {
  seriesId: string;
  slug: string;
  sortOrder: number;
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  images: string[];
  imageUrl: string;
};

export type PresignUploadResponse = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresIn: number;
};

type RawRecord = Record<string, unknown>;

function readString(record: RawRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return "";
}

function readNumber(record: RawRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") return value;
  }
  return 0;
}

function readStringArray(record: RawRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
  }
  return [];
}

function normalizeProduct(item: RawRecord): DashboardProduct {
  const images = readStringArray(item, "images", "Images");
  const imageUrl = readString(item, "imageUrl", "ImageURL");

  const productRowId = readString(item, "productId", "ProductID") || readString(item, "product_id");
  return {
    id: productRowId || readString(item, "id", "ID"),
    productId: readString(item, "productId", "ProductID"),
    seriesId: readString(item, "seriesId", "series_id"),
    state: readString(item, "state", "State"),
    name: readString(item, "name", "Name"),
    category: readString(item, "category", "Category"),
    material: readString(item, "material", "Material"),
    story: readString(item, "story", "Story"),
    tags: readStringArray(item, "tags", "Tags"),
    images,
    imageUrl: images[0] ?? imageUrl,
    slug: readString(item, "slug", "Slug"),
    sortOrder: readNumber(item, "sortOrder", "SortOrder"),
  };
}

function normalizeSeriesDraftSlice(raw: unknown): DashboardSeriesDraftSlice | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as RawRecord;
  const images = readStringArray(record, "images", "Images");
  const imageUrl = readString(record, "imageUrl", "ImageURL");
  const name = readString(record, "name", "Name");
  const versionId = readString(record, "versionId", "VersionId");
  if (!name || !versionId) return null;
  return {
    name,
    versionId,
    category: readString(record, "category", "Category"),
    material: readString(record, "material", "Material"),
    story: readString(record, "story", "Story"),
    tags: readStringArray(record, "tags", "Tags"),
    images,
    imageUrl: images[0] ?? imageUrl,
  };
}

function normalizeSeriesListItem(item: RawRecord): DashboardSeriesListItem {
  return {
    seriesId: readString(item, "seriesId", "series_id"),
    slug: readString(item, "slug", "Slug"),
    sortOrder: readNumber(item, "sortOrder", "SortOrder"),
    productCount: readNumber(item, "productCount", "product_count"),
    draft: normalizeSeriesDraftSlice(item.draft),
    published: normalizeSeriesDraftSlice(item.published),
  };
}

export type DashboardRelease = {
  id: string;
  releasedAt: string;
  note?: string;
};

function normalizeRelease(item: RawRecord): DashboardRelease {
  return {
    id: readString(item, "id", "ID"),
    releasedAt: readString(item, "releasedAt", "ReleasedAt"),
    note: readString(item, "note", "Note"),
  };
}

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
  dashboardTourStepAcks?: Record<string, number>;
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
    queryFn: async () => {
      const data = await apiRequest<DashboardMe>({ url: "/api/v1/auth/me" });
      return {
        ...data,
        dashboardTourStepAcks: data.dashboardTourStepAcks ?? {},
      };
    },
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
    mutationFn: (payload: { name: string; email: string; password: string; role: string }) =>
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
    queryFn: async () => {
      const response = await apiRequest<{ items: RawRecord[] }>({ url: "/api/v1/releases" });
      return { items: (response.items ?? []).map(normalizeRelease) };
    },
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
  const publishedProducts = useQuery({
    queryKey: ["dashboard-products-published-count"],
    queryFn: () => apiRequest<{ items: unknown[] }>({ url: "/api/v1/content/products?state=published" }),
    enabled: !!accessToken,
  });
  const publishedCopy = useQuery({
    queryKey: ["dashboard-copy-published-count"],
    queryFn: () => apiRequest<{ items: unknown[] }>({ url: "/api/v1/content/copy?state=published" }),
    enabled: !!accessToken,
  });

  const releasesList = releases.data?.items ?? [];
  const recentReleaseNotes = releasesList.slice(0, 5).map((item) => ({
    id: item.id,
    releasedAt: item.releasedAt,
    note: item.note ?? "",
  }));

  return {
    lastRelease: releasesList[0],
    draftProductsCount: products.data?.items?.length ?? 0,
    draftCopyCount: copy.data?.items?.length ?? 0,
    publishedProductsCount: publishedProducts.data?.items?.length ?? 0,
    publishedCopyCount: publishedCopy.data?.items?.length ?? 0,
    releaseCount: releasesList.length,
    recentReleaseNotes,
    isLoading:
      releases.isLoading ||
      products.isLoading ||
      copy.isLoading ||
      publishedProducts.isLoading ||
      publishedCopy.isLoading,
  };
}

export function useDashboardProducts() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["dashboard-products", accessToken],
    queryFn: async () => {
      const response = await apiRequest<{ items: RawRecord[] }>({ url: "/api/v1/content/products?state=draft" });
      return { items: (response.items ?? []).map(normalizeProduct) };
    },
    enabled: !!accessToken,
  });

  const createProduct = useMutation({
    mutationFn: (payload: DashboardProduct) =>
      apiRequest({ url: "/api/v1/content/products", method: "POST", data: payload }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-products-draft"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-series"] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DashboardProduct }) =>
      apiRequest({ url: `/api/v1/content/products/${id}/draft`, method: "PUT", data: payload }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-products-draft"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-series"] });
    },
  });

  return {
    products: productsQuery.data?.items ?? [],
    isLoading: productsQuery.isLoading,
    createProduct,
    updateProduct,
  };
}

export function useDashboardSeriesList() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["dashboard-series", accessToken],
    queryFn: async () => {
      const response = await apiRequest<{ items: RawRecord[] }>({ url: "/api/v1/content/series" });
      return {
        items: (response.items ?? []).map(normalizeSeriesListItem).filter((row) => row.seriesId.length > 0),
      };
    },
    enabled: !!accessToken,
  });
}

export function useDashboardProductsForSeries(seriesId: string | undefined) {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["dashboard-products-draft", seriesId, accessToken],
    queryFn: async () => {
      const q = seriesId
        ? `?state=draft&seriesId=${encodeURIComponent(seriesId)}`
        : "?state=draft";
      const response = await apiRequest<{ items: RawRecord[] }>({ url: `/api/v1/content/products${q}` });
      return { items: (response.items ?? []).map(normalizeProduct) };
    },
    enabled: !!accessToken && !!seriesId,
  });
}

type SeriesCreatePayload = {
  slug: string;
  sortOrder?: number;
  name: string;
  category?: string;
  material?: string;
  story?: string;
  tags?: string[];
  images?: string[];
  imageUrl?: string;
};

export function useSeriesDraftMutations() {
  const queryClient = useQueryClient();
  const createSeries = useMutation({
    mutationFn: (payload: SeriesCreatePayload) =>
      apiRequest<{ seriesId: string }>({ url: "/api/v1/content/series", method: "POST", data: payload }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-series"] });
    },
  });
  const updateSeries = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SeriesCreatePayload }) =>
      apiRequest({ url: `/api/v1/content/series/${id}/draft`, method: "PUT", data: payload }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-series"] });
    },
  });
  const unpublishSeries = useMutation({
    mutationFn: (id: string) =>
      apiRequest({ url: `/api/v1/content/series/${id}/unpublish`, method: "POST" }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-series"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-products-published"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-products"] });
    },
  });
  return { createSeries, updateSeries, unpublishSeries };
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
    queryFn: async () => {
      const response = await apiRequest<{ items: RawRecord[] }>({ url: "/api/v1/releases" });
      return { items: (response.items ?? []).map(normalizeRelease) };
    },
    enabled: !!accessToken,
  });

  const publish = useMutation({
    mutationFn: (note: string) => apiRequest({ url: "/api/v1/publish", method: "POST", data: { note } }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-releases"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-series"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-copy"] });
    },
  });

  const updateRelease = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiRequest({ url: `/api/v1/releases/${id}`, method: "PATCH", data: { note } }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-releases"] });
    },
  });

  const deleteRelease = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/api/v1/releases/${id}`, method: "DELETE" }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-releases"] });
    },
  });

  return {
    releases: releasesQuery.data?.items ?? [],
    isLoading: releasesQuery.isLoading,
    publish,
    updateRelease,
    deleteRelease,
  };
}

export function useDashboardPublishedContent() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["dashboard-products-published", accessToken],
    queryFn: async () => {
      const response = await apiRequest<{ items: RawRecord[] }>({ url: "/api/v1/content/products?state=published" });
      return { items: (response.items ?? []).map(normalizeProduct) };
    },
    enabled: !!accessToken,
  });

  const copyQuery = useQuery({
    queryKey: ["dashboard-copy-published", accessToken],
    queryFn: () => apiRequest<{ items: CopyItem[] }>({ url: "/api/v1/content/copy?state=published" }),
    enabled: !!accessToken,
  });

  const unpublishProduct = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/api/v1/content/products/${id}/unpublish`, method: "POST" }),
    onError: (error) => notifyApiError(normalizeApiError(error)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-products-published"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-products-draft"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-series"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-releases"] });
    },
  });

  return {
    publishedProducts: productsQuery.data?.items ?? [],
    publishedCopy: copyQuery.data?.items ?? [],
    isLoadingPublished: productsQuery.isLoading || copyQuery.isLoading,
    unpublishProduct,
  };
}

export function useDashboardDraftContent() {
  const accessToken = useDashboardAuthStore((s) => s.accessToken);

  const productsQuery = useQuery({
    queryKey: ["dashboard-products-draft", accessToken],
    queryFn: async () => {
      const response = await apiRequest<{ items: RawRecord[] }>({ url: "/api/v1/content/products?state=draft" });
      return { items: (response.items ?? []).map(normalizeProduct) };
    },
    enabled: !!accessToken,
  });

  const copyQuery = useQuery({
    queryKey: ["dashboard-copy-draft", accessToken],
    queryFn: () => apiRequest<{ items: CopyItem[] }>({ url: "/api/v1/content/copy?state=draft" }),
    enabled: !!accessToken,
  });

  return {
    draftProducts: productsQuery.data?.items ?? [],
    draftCopy: copyQuery.data?.items ?? [],
    isLoadingDraft: productsQuery.isLoading || copyQuery.isLoading,
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
