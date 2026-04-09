import { toast } from "sonner";
import type { NormalizedApiError } from "@/lib/http/errors";

const dedupeMap = new Map<string, number>();
const DEDUPE_WINDOW_MS = 3000;

function shouldSkip(message: string): boolean {
  const now = Date.now();
  const last = dedupeMap.get(message) ?? 0;
  dedupeMap.set(message, now);
  return now-last < DEDUPE_WINDOW_MS;
}

export function notifyApiError(error: NormalizedApiError) {
  const message = error.message || "Request failed.";
  if (shouldSkip(message)) return;

  if (error.status === 401) {
    toast.error("Session expired. Please sign in again.");
    return;
  }
  if (error.status === 403) {
    toast.warning("You do not have permission for this action.");
    return;
  }
  if (error.status === 422) {
    toast.info("Please review the highlighted fields.");
    return;
  }
  if (error.status && error.status >= 500) {
    toast.error("Server error. Please try again.");
    return;
  }
  toast.error(message);
}
