import type { DashboardProduct } from "@/lib/dashboardService";

export function normalizeTag(raw: string) {
  return raw.trim();
}

export function moveImageToPrimary(images: string[], image: string) {
  if (!images.includes(image)) return images;
  return [image, ...images.filter((item) => item !== image)];
}

export function buildProductPayload(form: DashboardProduct): DashboardProduct {
  const images = form.images?.filter(Boolean) ?? [];
  return {
    ...form,
    images,
    imageUrl: images[0] ?? form.imageUrl ?? "",
  };
}

export const emptyDashboardProduct: DashboardProduct = {
  name: "",
  category: "",
  material: "",
  size: "",
  story: "",
  tags: [],
  images: [],
  imageUrl: "",
  slug: "",
  sortOrder: 0,
};
