import type { z } from "zod";
import { API_PREFIX, API_TIMEOUT_MS, CACHED_API_TIMEOUT_MS, apiAppKey, apiBaseUrl } from "./config";
import { apiError, codeForStatus, type ApiResult } from "./errors";
import { visitorIp } from "./visitor";

// The one client for every backend call. Server-only: the browser never calls the backend.

type RequestOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Checks the response's shape, so a changed or broken backend can't put bad data on a page. */
  schema: z.ZodType<T>;
  /** Extra headers, such as the client's token. */
  headers?: Record<string, string>;
  /**
   * Caches a public response that's the same for every visitor, such as the catalogue. Only
   * successful responses are cached, so a failure never replaces good data.
   */
  cacheFor?: { revalidate: number; tags: string[] };
};

/** The backend's error body: {code, message, errors, detailCode}. Anything else is ignored. */
function readErrorBody(body: unknown): { message?: string; fieldErrors?: Record<string, string>; detailCode?: string } {
  if (typeof body !== "object" || body === null) return {};
  const { message, errors, detailCode } = body as { message?: unknown; errors?: unknown; detailCode?: unknown };
  const fieldErrors: Record<string, string> = {};
  if (typeof errors === "object" && errors !== null) {
    for (const [field, value] of Object.entries(errors)) {
      const text = Array.isArray(value) ? value[0] : value;
      if (typeof text === "string") fieldErrors[field] = text;
    }
  }
  return {
    message: typeof message === "string" ? message : undefined,
    fieldErrors,
    detailCode: typeof detailCode === "string" ? detailCode : undefined,
  };
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, schema, headers = {}, cacheFor }: RequestOptions<T>
): Promise<ApiResult<T>> {
  const base = apiBaseUrl();
  const appKey = apiAppKey();
  if (!base || !appKey) {
    console.error(`[api] ${base ? "BACKEND_APP_KEY" : "BACKEND_API_URL"} is not set`);
    return { ok: false, error: apiError("UNAVAILABLE") };
  }
  // Cached responses are shared by everyone, so they never carry one visitor's address.
  const visitor = cacheFor ? null : await visitorIp();

  let response: Response;
  try {
    response = await fetch(`${base}${API_PREFIX}${path}`, {
      method,
      headers: {
        accept: "application/json",
        "x-app-key": appKey,
        ...(visitor ? { "x-visitor-ip": visitor } : {}),
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(cacheFor ? { next: cacheFor } : { cache: "no-store" as const }),
      signal: AbortSignal.timeout(cacheFor ? CACHED_API_TIMEOUT_MS : API_TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`[api] ${method} ${path} could not reach the backend`, error instanceof Error ? error.name : "");
    return { ok: false, error: apiError("UNAVAILABLE") };
  }

  const payload: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const code = codeForStatus(response.status);
    const details = readErrorBody(payload);
    // Only messages meant for people (validation and conflicts) are shown as they are.
    const shown = code === "VALIDATION" || code === "CONFLICT" ? details : { detailCode: details.detailCode };
    return { ok: false, error: apiError(code, response.status, shown) };
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    console.error(`[api] ${method} ${path} returned an unexpected shape`);
    return { ok: false, error: apiError("UNEXPECTED", response.status) };
  }
  return { ok: true, data: parsed.data };
}
