"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/lib/dashboardService";

export default function DashboardOverviewPage() {
  const {
    lastRelease,
    draftProductsCount,
    draftCopyCount,
    publishedProductsCount,
    publishedCopyCount,
    releaseCount,
    recentReleaseNotes,
    isLoading,
  } = useDashboardOverview();

  const productMixData = [
    { name: "Draft", value: draftProductsCount, fill: "#111827" },
    { name: "Published", value: publishedProductsCount, fill: "#9ca3af" },
  ];

  const copyMixData = [
    { name: "Draft", value: draftCopyCount },
    { name: "Published", value: publishedCopyCount },
  ];
  const hasRecentReleaseNotes = recentReleaseNotes.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Last Release</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {lastRelease?.releasedAt ? new Date(lastRelease.releasedAt).toLocaleString() : "No release yet"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Draft Products</CardTitle>
          </CardHeader>
          <CardContent>{isLoading ? <Skeleton className="h-4 w-20" /> : <p className="text-3xl font-semibold">{draftProductsCount}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published Products</CardTitle>
          </CardHeader>
          <CardContent>{isLoading ? <Skeleton className="h-4 w-20" /> : <p className="text-3xl font-semibold">{publishedProductsCount}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Draft Copy</CardTitle>
          </CardHeader>
          <CardContent>{isLoading ? <Skeleton className="h-4 w-20" /> : <p className="text-3xl font-semibold">{draftCopyCount}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published Copy</CardTitle>
          </CardHeader>
          <CardContent>{isLoading ? <Skeleton className="h-4 w-20" /> : <p className="text-3xl font-semibold">{publishedCopyCount}</p>}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Product Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productMixData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Draft vs Published Content</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={copyMixData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#111827" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Releases ({releaseCount})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <Skeleton className="h-24 w-full" />}
          {!isLoading && !hasRecentReleaseNotes && <p className="text-sm text-muted-foreground">No release history yet.</p>}
          {!isLoading &&
            hasRecentReleaseNotes &&
            recentReleaseNotes.map((item) => (
              <div key={item.id} className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">{new Date(item.releasedAt).toLocaleString()}</p>
                <p className="text-sm">{item.note || "No note"}</p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
