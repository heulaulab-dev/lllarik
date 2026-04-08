"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/lib/dashboardService";

export default function DashboardOverviewPage() {
  const { lastRelease, draftProductsCount, draftCopyCount, isLoading } = useDashboardOverview();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Last Release</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {lastRelease?.releasedAt
                ? new Date(lastRelease.releasedAt).toLocaleString()
                : "No release yet"}
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Draft Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-4 w-20" /> : <p className="text-3xl font-semibold">{draftProductsCount}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Draft Copy Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-4 w-20" /> : <p className="text-3xl font-semibold">{draftCopyCount}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
