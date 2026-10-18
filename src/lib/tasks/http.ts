/** Shared JSON response helpers for the /api routes. Consistent shape: { data } or { error }. */
export function ok(data: unknown, status = 200) {
  return Response.json({ data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function apiError(status: number, code: string, message: string, details?: Record<string, string>) {
  return Response.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export const notFound = () => apiError(404, "NOT_FOUND", "Task not found");
export const badId = () => apiError(400, "INVALID_ID", "Task id must be a positive whole number");

export async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}

/** Centralized error handling: never leak database errors or stack traces. */
export async function handle(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (err) {
    console.error("[api] unhandled error", err);
    return apiError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}
