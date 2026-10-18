import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Status, Task } from "./types";
import type { ValidTaskInput } from "./validation";

const COLUMNS =
  "id,title,description,priority,status,due_date,created_at,updated_at,completed_at";

function fail(error: unknown): never {
  console.error("[tasks] database error", error);
  throw new Error("DATABASE_ERROR");
}

export async function listTasks(q: { status?: string; priority?: string; search?: string }) {
  let query = supabaseAdmin.from("tasks").select(COLUMNS).order("created_at", { ascending: false });
  if (q.status) query = query.eq("status", q.status);
  if (q.priority) query = query.eq("priority", q.priority);
  if (q.search) {
    const s = q.search.replace(/[,()*%\\_]/g, " ").trim();
    if (s) query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
  }
  const { data, error } = await query;
  if (error) fail(error);
  return (data ?? []) as Task[];
}

export async function getTask(id: number) {
  const { data, error } = await supabaseAdmin.from("tasks").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) fail(error);
  return (data as Task | null) ?? null;
}

export async function createTask(input: ValidTaskInput) {
  const status = input.status ?? "pending";
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description,
      priority: input.priority,
      due_date: input.due_date,
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .select(COLUMNS)
    .single();
  if (error) fail(error);
  return data as Task;
}

export async function updateTask(id: number, input: ValidTaskInput) {
  const current = await getTask(id);
  if (!current) return null;
  const status = input.status ?? current.status;
  const completed_at =
    status === "completed" ? (current.completed_at ?? new Date().toISOString()) : null;
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .update({
      title: input.title,
      description: input.description,
      priority: input.priority,
      due_date: input.due_date,
      status,
      completed_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) fail(error);
  return (data as Task | null) ?? null;
}

export async function setTaskStatus(id: number, status: Status) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .update({ status, completed_at: status === "completed" ? now : null, updated_at: now })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) fail(error);
  return (data as Task | null) ?? null;
}

export async function deleteTask(id: number) {
  const { data, error } = await supabaseAdmin.from("tasks").delete().eq("id", id).select("id");
  if (error) fail(error);
  return (data ?? []).length > 0;
}
