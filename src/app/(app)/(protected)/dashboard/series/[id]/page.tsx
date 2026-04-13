"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useDashboardProductsForSeries,
  useDashboardSeriesList,
  useDashboardProducts,
  useSeriesDraftMutations,
  type DashboardProduct,
  type DashboardSeriesForm,
  type PresignUploadResponse,
} from "@/lib/dashboardService";
import { apiRequest } from "@/lib/http/client";
import {
  buildProductPayload,
  emptyDashboardProduct,
  moveImageToPrimary,
  normalizeTag,
} from "../../product-form-helpers";

type UploadItem = {
  key: string;
  name: string;
  url: string;
  status: "uploading" | "success" | "failed";
  error?: string;
};

function getUploadBadgeVariant(status: UploadItem["status"]): "destructive" | "secondary" | "outline" {
  if (status === "failed") return "destructive";
  if (status === "uploading") return "secondary";
  return "outline";
}

function resolveRowImages(images: string[] | undefined, imageUrl: string) {
  if (images && images.length > 0) return images;
  if (imageUrl) return [imageUrl];
  return [];
}

const emptySeriesForm = (seriesId: string): DashboardSeriesForm => ({
  seriesId,
  slug: "",
  sortOrder: 0,
  name: "",
  category: "",
  material: "",
  story: "",
  tags: [],
  images: [],
  imageUrl: "",
});

export default function DashboardSeriesDetailPage() {
  const params = useParams();
  const seriesId = typeof params.id === "string" ? params.id : "";

  const { data: seriesData, isLoading: seriesLoading } = useDashboardSeriesList();
  const { data: productsData, isLoading: productsLoading } = useDashboardProductsForSeries(seriesId || undefined);
  const { createProduct, updateProduct } = useDashboardProducts();
  const { updateSeries, unpublishSeries } = useSeriesDraftMutations();

  const row = useMemo(
    () => seriesData?.items.find((s) => s.seriesId === seriesId),
    [seriesData?.items, seriesId],
  );

  const [seriesForm, setSeriesForm] = useState<DashboardSeriesForm>(() => emptySeriesForm(seriesId));
  const [productForm, setProductForm] = useState<DashboardProduct>(() => ({
    ...emptyDashboardProduct,
    seriesId,
  }));
  const [editingProductId, setEditingProductId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [seriesTagInput, setSeriesTagInput] = useState("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [seriesUploads, setSeriesUploads] = useState<UploadItem[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [seriesUploadError, setSeriesUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [seriesDragOver, setSeriesDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const seriesFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!seriesId) return;
    setProductForm((p) => ({ ...p, seriesId }));
  }, [seriesId]);

  useEffect(() => {
    if (!row) return;
    const src = row.draft ?? row.published;
    if (!src) return;
    const imgs = src.images?.length ? src.images : src.imageUrl ? [src.imageUrl] : [];
    setSeriesForm({
      seriesId: row.seriesId,
      slug: row.slug,
      sortOrder: row.sortOrder,
      name: src.name,
      category: src.category,
      material: src.material,
      story: src.story,
      tags: src.tags ?? [],
      images: imgs,
      imageUrl: imgs[0] ?? src.imageUrl ?? "",
    });
    setSeriesUploads(
      imgs.map((url) => ({
        key: url,
        name: url.split("/").pop() || "image",
        url,
        status: "success" as const,
      })),
    );
  }, [row]);

  const productRows = useMemo(
    () =>
      (productsData?.items ?? []).map((item) => ({
        ...item,
        id: String(item.id ?? item.productId ?? ""),
      })),
    [productsData?.items],
  );

  const isUploading = uploads.some((u) => u.status === "uploading");
  const seriesIsUploading = seriesUploads.some((u) => u.status === "uploading");

  function resetProductForm() {
    setEditingProductId("");
    setProductForm({ ...emptyDashboardProduct, seriesId });
    setTagInput("");
    setUploads([]);
    setUploadError("");
  }

  function addProductTag(raw: string) {
    const value = normalizeTag(raw);
    if (!value) return;
    setProductForm((current) => {
      const exists = current.tags.some((tag) => tag.toLowerCase() === value.toLowerCase());
      if (exists) return current;
      return { ...current, tags: [...current.tags, value] };
    });
    setTagInput("");
  }

  function addSeriesTag(raw: string) {
    const value = normalizeTag(raw);
    if (!value) return;
    setSeriesForm((current) => {
      const exists = current.tags.some((tag) => tag.toLowerCase() === value.toLowerCase());
      if (exists) return current;
      return { ...current, tags: [...current.tags, value] };
    });
    setSeriesTagInput("");
  }

  async function uploadProductFile(file: File) {
    const key = `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const localPreview = URL.createObjectURL(file);
    setUploads((c) => [...c, { key, name: file.name, url: localPreview, status: "uploading" }]);
    try {
      const presign = await apiRequest<PresignUploadResponse>({
        url: "/api/v1/storage/presign-upload",
        method: "POST",
        data: { fileName: file.name, contentType: file.type || "application/octet-stream", folder: "products" },
      });
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!uploadResponse.ok) throw new Error(`upload failed with ${uploadResponse.status}`);
      setUploads((c) => c.map((item) => (item.key === key ? { ...item, url: presign.publicUrl, status: "success" } : item)));
      setProductForm((current) => {
        const nextImages = [...(current.images ?? []), presign.publicUrl];
        return { ...current, images: nextImages, imageUrl: nextImages[0] ?? "" };
      });
      setUploadError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      setUploads((c) => c.map((item) => (item.key === key ? { ...item, status: "failed", error: message } : item)));
      setUploadError("Some images failed to upload.");
    }
  }

  async function uploadSeriesFile(file: File) {
    const key = `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const localPreview = URL.createObjectURL(file);
    setSeriesUploads((c) => [...c, { key, name: file.name, url: localPreview, status: "uploading" }]);
    try {
      const presign = await apiRequest<PresignUploadResponse>({
        url: "/api/v1/storage/presign-upload",
        method: "POST",
        data: { fileName: file.name, contentType: file.type || "application/octet-stream", folder: "products" },
      });
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!uploadResponse.ok) throw new Error(`upload failed with ${uploadResponse.status}`);
      setSeriesUploads((c) => c.map((item) => (item.key === key ? { ...item, url: presign.publicUrl, status: "success" } : item)));
      setSeriesForm((current) => {
        const nextImages = [...(current.images ?? []), presign.publicUrl];
        return { ...current, images: nextImages, imageUrl: nextImages[0] ?? "" };
      });
      setSeriesUploadError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      setSeriesUploads((c) => c.map((item) => (item.key === key ? { ...item, status: "failed", error: message } : item)));
      setSeriesUploadError("Some images failed to upload.");
    }
  }

  if (!seriesId) {
    return <p className="text-muted-foreground text-sm">Invalid series.</p>;
  }

  if (!seriesLoading && !row) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Series not found.</p>
        <Link href="/dashboard/series" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Back to series
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/series" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}>
          ← All series
        </Link>
        {row?.published ? (
          <Button
            type="button"
            variant="outline"
            disabled={unpublishSeries.isPending}
            onClick={() => {
              if (
                !window.confirm(
                  "Unpublish this series? All published products in this series will be archived on the public site.",
                )
              ) {
                return;
              }
              void unpublishSeries.mutateAsync(seriesId);
            }}
          >
            Unpublish series
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Series draft</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Slug" value={seriesForm.slug} onChange={(e) => setSeriesForm((v) => ({ ...v, slug: e.target.value }))} />
          <Input
            type="number"
            placeholder="Sort order"
            value={seriesForm.sortOrder}
            onChange={(e) => setSeriesForm((v) => ({ ...v, sortOrder: Number(e.target.value) || 0 }))}
          />
          <Input placeholder="Name" value={seriesForm.name} onChange={(e) => setSeriesForm((v) => ({ ...v, name: e.target.value }))} />
          <Input
            placeholder="Category"
            value={seriesForm.category}
            onChange={(e) => setSeriesForm((v) => ({ ...v, category: e.target.value }))}
          />
          <Input
            placeholder="Material"
            value={seriesForm.material}
            onChange={(e) => setSeriesForm((v) => ({ ...v, material: e.target.value }))}
          />
          <Textarea placeholder="Story" value={seriesForm.story} onChange={(e) => setSeriesForm((v) => ({ ...v, story: e.target.value }))} />
          <div className="space-y-2">
            <p className="text-sm font-medium">Tags</p>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={seriesTagInput}
                onChange={(e) => setSeriesTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSeriesTag(seriesTagInput);
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addSeriesTag(seriesTagInput)}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {seriesForm.tags.map((tag) => (
                <button key={tag} type="button" onClick={() => setSeriesForm((v) => ({ ...v, tags: v.tags.filter((t) => t !== tag) }))}>
                  <Badge variant="outline">
                    {tag} ×
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Images</p>
            <div
              className={cn(
                "rounded-md border border-dashed p-4 text-sm transition-colors",
                seriesDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30",
              )}
              onDrop={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setSeriesDragOver(false);
                const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
                void Promise.all(files.map((f) => uploadSeriesFile(f)));
              }}
              onDragOver={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setSeriesDragOver(true);
              }}
              onDragLeave={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setSeriesDragOver(false);
              }}
            >
              <input
                ref={seriesFileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const selected = e.target.files ? Array.from(e.target.files) : [];
                  void Promise.all(selected.map((f) => uploadSeriesFile(f)));
                  e.target.value = "";
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => seriesFileRef.current?.click()}>
                Choose images
              </Button>
            </div>
            {seriesUploadError ? <p className="text-destructive text-xs">{seriesUploadError}</p> : null}
            <div className="grid grid-cols-2 gap-2">
              {seriesUploads.map((upload) => (
                <div key={upload.key} className="space-y-2 rounded-md border p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={upload.url} alt={upload.name} className="h-20 w-full rounded object-cover" />
                  <Badge variant={getUploadBadgeVariant(upload.status)}>{upload.status}</Badge>
                  {(seriesForm.images ?? []).includes(upload.url) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSeriesForm((v) => {
                          const next = moveImageToPrimary(v.images ?? [], upload.url);
                          return { ...v, images: next, imageUrl: next[0] ?? "" };
                        })
                      }
                    >
                      Set primary
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSeriesForm((v) => {
                        const next = (v.images ?? []).filter((x) => x !== upload.url);
                        return { ...v, images: next, imageUrl: next[0] ?? "" };
                      });
                      setSeriesUploads((c) => c.filter((x) => x.url !== upload.url));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            disabled={seriesIsUploading || !seriesForm.name || !seriesForm.slug || updateSeries.isPending}
            onClick={() =>
              void updateSeries.mutateAsync({
                id: seriesId,
                payload: {
                  slug: seriesForm.slug,
                  sortOrder: seriesForm.sortOrder,
                  name: seriesForm.name,
                  category: seriesForm.category,
                  material: seriesForm.material,
                  story: seriesForm.story,
                  tags: seriesForm.tags,
                  images: seriesForm.images ?? [],
                  imageUrl: seriesForm.imageUrl,
                },
              })
            }
          >
            Save series draft
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Products in series {productsLoading ? "(loading…)" : ""}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productRows.map((r) => (
                  <TableRow
                    key={r.id || r.name}
                    className="cursor-pointer"
                    onClick={() => {
                      const rowImages = resolveRowImages(r.images, r.imageUrl);
                      setEditingProductId(r.id);
                      setProductForm({
                        ...r,
                        seriesId,
                        id: r.id,
                        tags: r.tags ?? [],
                        images: rowImages,
                        slug: r.slug ?? "",
                        size: r.size ?? "",
                        sortOrder: r.sortOrder ?? 0,
                      });
                      setUploads(
                        rowImages.map((url) => ({
                          key: url,
                          name: url.split("/").pop() || "image",
                          url,
                          status: "success",
                        })),
                      );
                    }}
                  >
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="font-mono text-xs">{r.slug || "—"}</TableCell>
                    <TableCell className="max-w-32 truncate text-muted-foreground text-xs">{r.size || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.state ?? "draft"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{editingProductId ? "Edit product" : "New product"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm((v) => ({ ...v, name: e.target.value }))} />
            <Input
              placeholder="Category"
              value={productForm.category}
              onChange={(e) => setProductForm((v) => ({ ...v, category: e.target.value }))}
            />
            <Input
              placeholder="Material"
              value={productForm.material}
              onChange={(e) => setProductForm((v) => ({ ...v, material: e.target.value }))}
            />
            <Input placeholder="Size (e.g. 180 × 60 cm)" value={productForm.size} onChange={(e) => setProductForm((v) => ({ ...v, size: e.target.value }))} />
            <Input placeholder="Slug" value={productForm.slug} onChange={(e) => setProductForm((v) => ({ ...v, slug: e.target.value }))} />
            <Textarea placeholder="Story" value={productForm.story} onChange={(e) => setProductForm((v) => ({ ...v, story: e.target.value }))} />
            <div className="space-y-2">
              <p className="text-sm font-medium">Tags</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addProductTag(tagInput);
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => addProductTag(tagInput)}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {productForm.tags.map((tag) => (
                  <button key={tag} type="button" onClick={() => setProductForm((v) => ({ ...v, tags: v.tags.filter((t) => t !== tag) }))}>
                    <Badge variant="outline">
                      {tag} ×
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Images</p>
              <div
                className={cn(
                  "rounded-md border border-dashed p-4 text-sm transition-colors",
                  isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30",
                )}
                onDrop={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
                  void Promise.all(files.map((f) => uploadProductFile(f)));
                }}
                onDragOver={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const selected = e.target.files ? Array.from(e.target.files) : [];
                    void Promise.all(selected.map((f) => uploadProductFile(f)));
                    e.target.value = "";
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Choose images
                </Button>
              </div>
              {uploadError ? <p className="text-destructive text-xs">{uploadError}</p> : null}
              <div className="grid grid-cols-2 gap-2">
                {uploads.map((upload) => (
                  <div key={upload.key} className="space-y-2 rounded-md border p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={upload.url} alt={upload.name} className="h-20 w-full rounded object-cover" />
                    <Badge variant={getUploadBadgeVariant(upload.status)}>{upload.status}</Badge>
                    {(productForm.images ?? []).includes(upload.url) ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setProductForm((v) => {
                            const next = moveImageToPrimary(v.images ?? [], upload.url);
                            return { ...v, images: next, imageUrl: next[0] ?? "" };
                          })
                        }
                      >
                        Set primary
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProductForm((v) => {
                          const next = (v.images ?? []).filter((x) => x !== upload.url);
                          return { ...v, images: next, imageUrl: next[0] ?? "" };
                        });
                        setUploads((c) => c.filter((x) => x.url !== upload.url));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Button
              className="w-full"
              disabled={
                createProduct.isPending ||
                updateProduct.isPending ||
                isUploading ||
                !productForm.name ||
                !productForm.slug ||
                !seriesId
              }
              onClick={async () => {
                const payload = buildProductPayload({ ...productForm, seriesId });
                if (editingProductId) {
                  await updateProduct.mutateAsync({ id: editingProductId, payload });
                } else {
                  await createProduct.mutateAsync(payload);
                }
                resetProductForm();
              }}
            >
              {isUploading ? "Uploading…" : editingProductId ? "Save product draft" : "Create product draft"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => resetProductForm()}>
              Clear product form
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
