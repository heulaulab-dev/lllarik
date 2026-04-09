import axios from "axios";

export type NormalizedApiError = {
  status: number | null;
  code?: string;
  message: string;
  details?: unknown;
};

function getMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  const value = record.error ?? record.message;
  return typeof value === "string" ? value : undefined;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const data = error.response?.data;
    return {
      status,
      code: typeof data === "object" && data && typeof (data as Record<string, unknown>).code === "string"
        ? ((data as Record<string, unknown>).code as string)
        : undefined,
      message: getMessage(data) ?? error.message ?? "Request failed",
      details: data,
    };
  }

  if (error instanceof Error) {
    return { status: null, message: error.message };
  }

  return { status: null, message: "Request failed" };
}
