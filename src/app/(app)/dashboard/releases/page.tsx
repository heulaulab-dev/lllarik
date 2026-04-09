"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardReleases } from "@/lib/dashboardService";

export default function DashboardReleasesPage() {
  const [note, setNote] = useState("");
  const { releases, publish } = useDashboardReleases();

  return (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell className="truncate max-w-48">{release.id}</TableCell>
                  <TableCell>{new Date(release.releasedAt).toLocaleString()}</TableCell>
                  <TableCell>{release.note || "-"}</TableCell>
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
    </div>
  );
}
