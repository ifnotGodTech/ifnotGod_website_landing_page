// Every backend failure in one shape, with a plain message a visitor can act on. Never a raw error.

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UNAVAILABLE"
  | "UNEXPECTED";

export type ApiError = {
  code: ApiErrorCode;
  /** The HTTP status, or null when the backend couldn't be reached. */
  status: number | null;
  message: string;
  /** Per-field messages from the backend's validation, keyed by field name. */
  fieldErrors: Record<string, string>;
  /** A more specific code from the backend, such as "EMAIL_TAKEN", for screens that need it. */
  detailCode?: string;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHENTICATED: "Your session has ended. Please log in again.",
  FORBIDDEN: "You don't have access to that.",
  NOT_FOUND: "We couldn't find that.",
  VALIDATION: "Please check the highlighted fields and try again.",
  CONFLICT: "That couldn't be done, because something changed. Refresh and try again.",
  RATE_LIMITED: "Too many attempts. Please wait a few minutes, then try again.",
  UNAVAILABLE: "We can't reach our servers right now. Please try again in a moment.",
  UNEXPECTED: "Something went wrong on our side. Please try again.",
};

export function codeForStatus(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHENTICATED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 400 || status === 422) return "VALIDATION";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  if (status === 502 || status === 503 || status === 504) return "UNAVAILABLE";
  return "UNEXPECTED";
}

export function apiError(
  code: ApiErrorCode,
  status: number | null = null,
  details: { message?: string; fieldErrors?: Record<string, string>; detailCode?: string } = {}
): ApiError {
  return {
    code,
    status,
    message: details.message ?? DEFAULT_MESSAGES[code],
    fieldErrors: details.fieldErrors ?? {},
    ...(details.detailCode ? { detailCode: details.detailCode } : {}),
  };
}
