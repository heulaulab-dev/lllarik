export default function GlobalLoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="flex items-center gap-3 rounded-full border bg-background px-4 py-2">
        <span className="size-2 animate-pulse rounded-full bg-foreground/80" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </main>
  );
}
