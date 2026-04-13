"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDashboardSeriesList, useSeriesDraftMutations } from "@/lib/dashboardService";

export default function DashboardSeriesListPage() {
  const router = useRouter();
  const { data, isLoading } = useDashboardSeriesList();
  const { createSeries } = useSeriesDraftMutations();
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");

  const items = data?.items ?? [];

  async function handleCreate() {
    const res = await createSeries.mutateAsync({
      slug: slug.trim(),
      name: name.trim(),
      story: ".",
      sortOrder: 0,
      images: ["https://placehold.co/800x1000/e8e8e8/666.png?text=Series"],
    });
    setOpen(false);
    setSlug("");
    setName("");
    router.push(`/dashboard/series/${res.seriesId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Series</h1>
          <p className="text-muted-foreground text-sm">Create a series, then add products under it.</p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          New series
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All series</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground text-sm">No series yet. Create one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Draft</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.seriesId}>
                    <TableCell className="font-mono text-xs">{row.slug}</TableCell>
                    <TableCell>{row.draft?.name ?? row.published?.name ?? "—"}</TableCell>
                    <TableCell>{row.productCount}</TableCell>
                    <TableCell>
                      {row.draft ? <Badge variant="secondary">draft</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {row.published ? <Badge variant="outline">live</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/series/${row.seriesId}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New series</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Slug (URL key)" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <Input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!slug.trim() || !name.trim() || createSeries.isPending}
              onClick={() => void handleCreate()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
