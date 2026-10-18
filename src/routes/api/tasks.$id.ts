import { createFileRoute } from "@tanstack/react-router";
import { apiError, badId, handle, notFound, ok, readJson } from "@/lib/tasks/http";
import { parseTaskId, validateTaskInput } from "@/lib/tasks/validation";

export const Route = createFileRoute("/api/tasks/$id")({
  server: {
    handlers: {
      GET: ({ params }) =>
        handle(async () => {
          const id = parseTaskId(params.id);
          if (!id) return badId();
          const repo = await import("@/lib/tasks/repo.server");
          const task = await repo.getTask(id);
          return task ? ok(task) : notFound();
        }),
      PUT: ({ params, request }) =>
        handle(async () => {
          const id = parseTaskId(params.id);
          if (!id) return badId();
          const parsed = await readJson(request);
          if (!parsed.ok) return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
          const v = validateTaskInput(parsed.body);
          if (!v.ok) return apiError(422, "VALIDATION_ERROR", "Please fix the highlighted fields", v.errors);
          const repo = await import("@/lib/tasks/repo.server");
          const task = await repo.updateTask(id, v.data);
          return task ? ok(task) : notFound();
        }),
      DELETE: ({ params }) =>
        handle(async () => {
          const id = parseTaskId(params.id);
          if (!id) return badId();
          const repo = await import("@/lib/tasks/repo.server");
          return (await repo.deleteTask(id)) ? ok({ id, deleted: true }) : notFound();
        }),
    },
  },
});
