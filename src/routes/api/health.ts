import { createFileRoute } from "@tanstack/react-router";
import { ok } from "@/lib/tasks/http";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => ok({ status: "ok", time: new Date().toISOString() }),
    },
  },
});
