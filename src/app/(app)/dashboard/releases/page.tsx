"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDashboardDraftContent, useDashboardPublishedContent, useDashboardReleases } from "@/lib/dashboardService";

function formatReleaseId(id: string) {
  if (!id) return "REL-UNKNOWN";
  return `REL-${id.slice(0, 8).toUpperCase()}`;
}

export default function DashboardReleasesPage() {
  const [note, setNote] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);
  const [selectedReleaseId, setSelectedReleaseId] = useState("");
  const [selectedReleaseNote, setSelectedReleaseNote] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const { releases, publish, updateRelease, deleteRelease } = useDashboardReleases();
  const { publishedProducts, publishedCopy, isLoadingPublished, unpublishProduct } = useDashboardPublishedContent();
  const { draftProducts, draftCopy, isLoadingDraft } = useDashboardDraftContent();
  const showPublishedProductsEmpty = !isLoadingPublished && publishedProducts.length === 0;
  const showPublishedCopyEmpty = !isLoadingPublished && publishedCopy.length === 0;
  const showDraftProductsEmpty = !isLoadingDraft && draftProducts.length === 0;
  const showDraftCopyEmpty = !isLoadingDraft && draftCopy.length === 0;

  function openEditDialog(id: string, currentNote?: string) {
    setSelectedReleaseId(id);
    setSelectedReleaseNote(currentNote ?? "");
    setIsEditDialogOpen(true);
  }

  function openDeleteDialog(id: string, currentNote?: string) {
    setSelectedReleaseId(id);
    setSelectedReleaseNote(currentNote ?? "");
    setIsDeleteDialogOpen(true);
  }

  function openUnpublishDialog(id: string, name?: string) {
    setSelectedProductId(id);
    setSelectedProductName(name ?? "");
    setIsUnpublishDialogOpen(true);
  }

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Release Note</DialogTitle>
            <DialogDescription>Update the note shown in release history.</DialogDescription>
          </DialogHeader>
          <Textarea value={selectedReleaseNote} onChange={(e) => setSelectedReleaseNote(e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={updateRelease.isPending || !selectedReleaseId}
              onClick={async () => {
                await updateRelease.mutateAsync({ id: selectedReleaseId, note: selectedReleaseNote });
                setIsEditDialogOpen(false);
              }}
            >
              {updateRelease.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Release</DialogTitle>
            <DialogDescription>
              This removes the selected release history record.
              {selectedReleaseNote ? `\n\nNote: "${selectedReleaseNote}"` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteRelease.isPending || !selectedReleaseId}
              onClick={async () => {
                await deleteRelease.mutateAsync(selectedReleaseId);
                setIsDeleteDialogOpen(false);
              }}
            >
              {deleteRelease.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUnpublishDialogOpen} onOpenChange={setIsUnpublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unpublish Product</DialogTitle>
            <DialogDescription>
              This will archive the currently published version.
              {selectedProductName ? `\n\nProduct: "${selectedProductName}"` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsUnpublishDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={unpublishProduct.isPending || !selectedProductId}
              onClick={async () => {
                await unpublishProduct.mutateAsync(selectedProductId);
                setIsUnpublishDialogOpen(false);
              }}
            >
              {unpublishProduct.isPending ? "Unpublishing..." : "Unpublish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Release History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Released At</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release, index) => (
                <TableRow key={`${release.id || "release"}-${release.releasedAt || "unknown"}-${index}`}>
                  <TableCell className="truncate max-w-48">{formatReleaseId(release.id)}</TableCell>
                  <TableCell>{new Date(release.releasedAt).toLocaleString()}</TableCell>
                  <TableCell>{release.note || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={updateRelease.isPending || !release.id}
                        onClick={() => {
                          if (!release.id) return;
                          openEditDialog(release.id, release.note);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={deleteRelease.isPending || !release.id}
                        onClick={() => {
                          if (!release.id) return;
                          openDeleteDialog(release.id, release.note);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Publish Draft</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Release note (optional)" />
          <Button
            className="w-full"
            disabled={publish.isPending}
            onClick={async () => {
              await publish.mutateAsync(note);
              setNote("");
            }}
          >
            {publish.isPending ? "Publishing..." : "Publish Current Draft"}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Active Published Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Image Preview</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPublished && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Loading published products...
                  </TableCell>
                </TableRow>
              )}
              {showPublishedProductsEmpty && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No published products yet.
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingPublished && !showPublishedProductsEmpty && (
                publishedProducts.map((product, index) => (
                  <TableRow key={`${product.id || product.slug || "product"}-${index}`}>
                    <TableCell>{product.name || "-"}</TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>
                      {product.imageUrl ? (
                        <div className="flex items-center gap-2">
                          <Image
                            src={product.imageUrl}
                            alt={product.name || "Published product image"}
                            width={64}
                            height={64}
                            className="h-12 w-12 rounded object-cover border"
                            unoptimized
                          />
                          <span className="text-xs text-muted-foreground truncate max-w-40">{product.imageUrl}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={unpublishProduct.isPending || !(product.productId || product.id)}
                        onClick={() => {
                          const targetId = product.productId || product.id || "";
                          if (!targetId) return;
                          openUnpublishDialog(targetId, product.name);
                        }}
                      >
                        Unpublish
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Active Published Copy</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Option</TableHead>
                <TableHead>Value Text</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPublished && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    Loading published copy...
                  </TableCell>
                </TableRow>
              )}
              {showPublishedCopyEmpty && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    No published copy yet.
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingPublished && !showPublishedCopyEmpty && (
                publishedCopy.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell>{item.key}</TableCell>
                    <TableCell className="truncate max-w-64">{item.value || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Current Draft Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Image Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingDraft && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    Loading draft products...
                  </TableCell>
                </TableRow>
              )}
              {showDraftProductsEmpty && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No draft products currently.
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingDraft && !showDraftProductsEmpty && (
                draftProducts.map((product, index) => (
                  <TableRow key={`${product.id || product.slug || "draft-product"}-${index}`}>
                    <TableCell>{product.name || "-"}</TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>
                      {product.imageUrl ? (
                        <div className="flex items-center gap-2">
                          <Image
                            src={product.imageUrl}
                            alt={product.name || "Draft product image"}
                            width={64}
                            height={64}
                            className="h-12 w-12 rounded object-cover border"
                            unoptimized
                          />
                          <span className="text-xs text-muted-foreground truncate max-w-40">{product.imageUrl}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Current Draft Copy</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Option</TableHead>
                <TableHead>Value Text</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingDraft && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    Loading draft copy...
                  </TableCell>
                </TableRow>
              )}
              {showDraftCopyEmpty && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    No draft copy currently.
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingDraft && !showDraftCopyEmpty && (
                draftCopy.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell>{item.key}</TableCell>
                    <TableCell className="truncate max-w-64">{item.value || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
