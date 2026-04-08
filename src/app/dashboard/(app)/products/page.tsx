"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardProducts, type DashboardProduct } from "@/lib/dashboardService";

const emptyProduct: DashboardProduct = {
  name: "",
  category: "",
  material: "",
  story: "",
  tags: [],
  imageUrl: "",
  slug: "",
  sortOrder: 0,
};

export default function DashboardProductsPage() {
  const { products, createProduct, updateProduct } = useDashboardProducts();
  const [form, setForm] = useState<DashboardProduct>(emptyProduct);
  const [editingId, setEditingId] = useState<string>("");

  const rows = useMemo(
    () =>
      products.map((item) => ({
        ...item,
        id: String(item.id ?? item.productId ?? ""),
      })),
    [products],
  );

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
                <TableHead>Category</TableHead>
                <TableHead>Image</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id || row.name}
                  className="cursor-pointer"
                  onClick={() => {
                    setEditingId(row.id);
                    setForm({
                      id: row.id,
                      name: row.name,
                      category: row.category,
                      material: row.material,
                      story: row.story,
                      tags: row.tags ?? [],
                      imageUrl: row.imageUrl,
                      slug: row.slug ?? "",
                      sortOrder: row.sortOrder ?? 0,
                    });
                  }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="truncate max-w-40">{row.imageUrl}</TableCell>
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
          <Input
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm((v) => ({ ...v, imageUrl: e.target.value }))}
          />
          <Textarea
            placeholder="Story"
            value={form.story}
            onChange={(e) => setForm((v) => ({ ...v, story: e.target.value }))}
          />
          <Input
            placeholder="Tags (comma separated)"
            value={form.tags.join(", ")}
            onChange={(e) =>
              setForm((v) => ({
                ...v,
                tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              }))
            }
          />
          <Button
            className="w-full"
            onClick={async () => {
              if (editingId) {
                await updateProduct.mutateAsync({ id: editingId, payload: form });
              } else {
                await createProduct.mutateAsync(form);
              }
              setEditingId("");
              setForm(emptyProduct);
            }}
            disabled={createProduct.isPending || updateProduct.isPending}
          >
            {editingId ? "Save Draft Changes" : "Create Draft Product"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
