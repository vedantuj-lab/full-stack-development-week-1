import { z } from "zod";
import { PRIORITIES, STATUSES } from "./types";

function isRealDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must use the YYYY-MM-DD format")
  .refine(isRealDate, "Due date is not a valid calendar date");

export const taskInputSchema = z
  .object({
    title: z
      .string({ required_error: "Title is required", invalid_type_error: "Title must be text" })
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer"),
    description: z
      .string({ invalid_type_error: "Description must be text" })
      .trim()
      .max(2000, "Description must be 2000 characters or fewer")
      .nullable()
      .optional()
      .transform((v) => (v ? v : null)),
    priority: z
      .enum(PRIORITIES, { errorMap: () => ({ message: "Priority must be low, medium or high" }) })
      .default("medium"),
    status: z
      .enum(STATUSES, { errorMap: () => ({ message: "Status must be pending or completed" }) })
      .optional(),
    due_date: z
      .union([dateString, z.literal(""), z.null()])
      .optional()
      .transform((v) => (v ? v : null)),
  })
  .strict();

export type ValidTaskInput = z.infer<typeof taskInputSchema>;

export type ValidationResult =
  | { ok: true; data: ValidTaskInput }
  | { ok: false; errors: Record<string, string> };

export function validateTaskInput(input: unknown): ValidationResult {
  const result = taskInputSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "body";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

/** Returns a positive integer id, or null when the value is not a valid id. */
export function parseTaskId(raw: string | undefined): number | null {
  if (!raw || !/^\d{1,15}$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

export function parseListQuery(params: URLSearchParams) {
  const errors: Record<string, string> = {};
  const status = params.get("status") || undefined;
  const priority = params.get("priority") || undefined;
  const search = params.get("search")?.trim().slice(0, 200) || undefined;
  if (status && !(STATUSES as readonly string[]).includes(status))
    errors.status = "Status must be pending or completed";
  if (priority && !(PRIORITIES as readonly string[]).includes(priority))
    errors.priority = "Priority must be low, medium or high";
  return { errors, status, priority, search };
}
