import { createFileRoute } from "@tanstack/react-router";
import { badId, handle, notFound, ok } from "@/lib/tasks/http";
import { parseTaskId } from "@/lib/tasks/validation";

export const Route = createFileRoute("/api/tasks/$id/reopen")({
  server: {
    handlers: {
      PATCH: ({ params }) =>
        handle(async () => {
          const id = parseTaskId(params.id);
          if (!id) return badId();
          const repo = await import("@/lib/tasks/repo.server");
          const task = await repo.setTaskStatus(id, "pending");
          return task ? ok(task) : notFound();
        }),
    },
  },
});
