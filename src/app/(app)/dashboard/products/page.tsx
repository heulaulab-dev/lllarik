"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDashboardProducts, type DashboardProduct, type PresignUploadResponse } from "@/lib/dashboardService";
import { apiRequest } from "@/lib/http/client";

type UploadItem = {
  key: string;
  name: string;
  url: string;
  status: "uploading" | "success" | "failed";
  error?: string;
};

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

const emptyProduct: DashboardProduct = {
  name: "",
  category: "",
  material: "",
  story: "",
  tags: [],
  images: [],
  imageUrl: "",
  slug: "",
  sortOrder: 0,
};

export default function DashboardProductsPage() {
  const { products, createProduct, updateProduct } = useDashboardProducts();
  const [form, setForm] = useState<DashboardProduct>(emptyProduct);
  const [editingId, setEditingId] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const rows = useMemo(
    () =>
      products.map((item) => ({
        ...item,
        id: String(item.id ?? item.productId ?? ""),
      })),
    [products],
  );

  const isUploading = uploads.some((item) => item.status === "uploading");
  let submitLabel = "Create Draft Product";
  if (isUploading) {
    submitLabel = "Uploading images...";
  } else if (editingId) {
    submitLabel = "Save Draft Changes";
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyProduct);
    setTagInput("");
    setUploads([]);
    setUploadError("");
  }

  function addTag(raw: string) {
    const value = normalizeTag(raw);
    if (!value) return;

    setForm((current) => {
      const exists = current.tags.some((tag) => tag.toLowerCase() === value.toLowerCase());
      if (exists) return current;
      return { ...current, tags: [...current.tags, value] };
    });
    setTagInput("");
  }

  function removeTag(tagValue: string) {
    setForm((current) => ({ ...current, tags: current.tags.filter((tag) => tag !== tagValue) }));
  }

  async function uploadFile(file: File) {
    const key = `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const localPreview = URL.createObjectURL(file);

    setUploads((current) => [...current, { key, name: file.name, url: localPreview, status: "uploading" }]);
    try {
      const presign = await apiRequest<PresignUploadResponse>({
        url: "/api/v1/storage/presign-upload",
        method: "POST",
        data: { fileName: file.name, contentType: file.type || "application/octet-stream", folder: "products" },
      });

      const uploadHost = new URL(presign.uploadUrl).hostname;
      if (uploadHost === "minio") {
        throw new Error(
          "Upload endpoint uses internal host 'minio'. Update API env so presign URL is browser-reachable (for local dev: MINIO_ENDPOINT=localhost:9000 and MINIO_PUBLIC_URL=http://localhost:9000).",
        );
      }

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!uploadResponse.ok) {
        throw new Error(`upload failed with ${uploadResponse.status}`);
      }

      setUploads((current) =>
        current.map((item) => (item.key === key ? { ...item, url: presign.publicUrl, status: "success", error: undefined } : item)),
      );
      setForm((current) => {
        const nextImages = [...(current.images ?? []), presign.publicUrl];
        return { ...current, images: nextImages, imageUrl: nextImages[0] ?? "" };
      });
      setUploadError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      setUploads((current) => current.map((item) => (item.key === key ? { ...item, status: "failed", error: message } : item)));
      setUploadError("Some images failed to upload. Remove or retry failed items.");
    }
  }

  async function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files ? Array.from(event.target.files) : [];
    if (selected.length === 0) return;
    for (const file of selected) await uploadFile(file);
    event.target.value = "";
  }

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    for (const file of files) {
      await uploadFile(file);
    }
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files ?? []).filter((file) => file.type.startsWith("image/"));
    await handleFiles(files);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
  }

  function removeImage(url: string) {
    setForm((current) => {
      const nextImages = (current.images ?? []).filter((item) => item !== url);
      return { ...current, images: nextImages, imageUrl: nextImages[0] ?? "" };
    });
    setUploads((current) => current.filter((item) => item.url !== url));
  }

  function setPrimary(url: string) {
    setForm((current) => {
      const nextImages = moveImageToPrimary(current.images ?? [], url);
      return { ...current, images: nextImages, imageUrl: nextImages[0] ?? "" };
    });
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Draft Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Image</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id || row.name}
                  className="cursor-pointer"
                  onClick={() => {
                    const rowImages = resolveRowImages(row.images, row.imageUrl);
                    setEditingId(row.id);
                    setForm({
                      id: row.id,
                      state: row.state ?? "draft",
                      name: row.name,
                      category: row.category,
                      material: row.material,
                      story: row.story,
                      tags: row.tags ?? [],
                      images: rowImages,
                      imageUrl: row.imageUrl,
                      slug: row.slug ?? "",
                      sortOrder: row.sortOrder ?? 0,
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
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.state ?? "draft"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.category || "Uncategorized"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.material || "Unknown"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(row.tags ?? []).slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {(row.tags ?? []).length > 2 ? <Badge variant="ghost">+{(row.tags ?? []).length - 2}</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="truncate max-w-40">
                    {(row.images?.length ?? 0) > 0 ? `${row.images?.length} images` : row.imageUrl || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Draft Product" : "Create Product"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((v) => ({ ...v, category: e.target.value }))}
          />
          <Input
            placeholder="Material"
            value={form.material}
            onChange={(e) => setForm((v) => ({ ...v, material: e.target.value }))}
          />
          <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: e.target.value }))} />
          <Textarea
            placeholder="Story"
            value={form.story}
            onChange={(e) => setForm((v) => ({ ...v, story: e.target.value }))}
          />
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
                    addTag(tagInput);
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addTag(tagInput)}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="cursor-pointer"
                  aria-label={`Remove tag ${tag}`}
                >
                  <Badge variant="outline">{tag} ×</Badge>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Images</p>
            <div
              className={`rounded-md border border-dashed p-4 text-sm transition-colors ${
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <p className="font-medium">Drag and drop images here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => fileInputRef.current?.click()}>
                Choose Images
              </Button>
            </div>
            {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
            <div className="grid grid-cols-2 gap-2">
              {uploads.map((upload) => (
                <div key={upload.key} className="rounded-md border p-2 space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={upload.url} alt={upload.name} className="h-20 w-full rounded object-cover" />
                  <p className="text-xs truncate">{upload.name}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={getUploadBadgeVariant(upload.status)}>{upload.status}</Badge>
                    {(form.images ?? []).includes(upload.url) ? (
                      <>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setPrimary(upload.url)}>
                          Set Primary
                        </Button>
                      </>
                    ) : null}
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(upload.url)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            onClick={async () => {
              const payload = buildProductPayload(form);
              if (editingId) {
                await updateProduct.mutateAsync({ id: editingId, payload });
              } else {
                await createProduct.mutateAsync(payload);
              }
              resetForm();
            }}
            disabled={createProduct.isPending || updateProduct.isPending || isUploading || !form.name || !form.slug}
          >
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              resetForm();
            }}
          >
            Clear Form
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
