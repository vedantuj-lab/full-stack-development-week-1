import type { Task, TaskInput } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, string>,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }
  let body: { data?: T; error?: { message: string; details?: Record<string, string> } } = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || body.error) {
    throw new ApiError(body.error?.message ?? `Request failed (${res.status})`, res.status, body.error?.details);
  }
  return body.data as T;
}

export const tasksApi = {
  list: () => request<Task[]>("/api/tasks"),
  get: (id: number) => request<Task>(`/api/tasks/${id}`),
  create: (input: TaskInput) => request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: TaskInput) =>
    request<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  complete: (id: number) => request<Task>(`/api/tasks/${id}/complete`, { method: "PATCH" }),
  reopen: (id: number) => request<Task>(`/api/tasks/${id}/reopen`, { method: "PATCH" }),
  remove: (id: number) => request<{ id: number }>(`/api/tasks/${id}`, { method: "DELETE" }),
};
