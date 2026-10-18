import { createFileRoute } from "@tanstack/react-router";
import { apiError, handle, ok, readJson } from "@/lib/tasks/http";
import { parseListQuery, validateTaskInput } from "@/lib/tasks/validation";

export const Route = createFileRoute("/api/tasks")({
  server: {
    handlers: {
      GET: ({ request }) =>
        handle(async () => {
          const q = parseListQuery(new URL(request.url).searchParams);
          if (Object.keys(q.errors).length)
            return apiError(400, "VALIDATION_ERROR", "Invalid query parameters", q.errors);
          const repo = await import("@/lib/tasks/repo.server");
          return ok(await repo.listTasks(q));
        }),
      POST: ({ request }) =>
        handle(async () => {
          const parsed = await readJson(request);
          if (!parsed.ok) return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
          const v = validateTaskInput(parsed.body);
          if (!v.ok) return apiError(422, "VALIDATION_ERROR", "Please fix the highlighted fields", v.errors);
          const repo = await import("@/lib/tasks/repo.server");
          return ok(await repo.createTask(v.data), 201);
        }),
    },
  },
});
