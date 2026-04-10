import Link from "next/link";

export default function GlobalNotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 text-center">
        <p className="text-xs tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm transition-colors hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
