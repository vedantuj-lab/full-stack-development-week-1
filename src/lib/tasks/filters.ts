import type { Priority, Status, Task } from "./types";

export type View = "overview" | "all" | "today" | "upcoming" | "completed" | "settings";
export type DueFilter = "all" | "overdue" | "today" | "week" | "none";
export type SortKey = "newest" | "oldest" | "due" | "priority";

export interface TaskFilters {
  search: string;
  status: "all" | Status;
  priority: "all" | Priority;
  due: DueFilter;
}

export const DEFAULT_FILTERS: TaskFilters = { search: "", status: "all", priority: "all", due: "all" };

export function toISODate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return toISODate(new Date(y, m - 1, d + days));
}

export function isOverdue(t: Task, today: string) {
  return t.status === "pending" && !!t.due_date && t.due_date < today;
}

export function inView(t: Task, view: View, today: string) {
  switch (view) {
    case "today":
      return t.status === "pending" && t.due_date === today;
    case "upcoming":
      return t.status === "pending" && !!t.due_date && t.due_date > today;
    case "completed":
      return t.status === "completed";
    default:
      return true;
  }
}

export function matchesFilters(t: Task, f: TaskFilters, today: string) {
  const q = f.search.trim().toLowerCase();
  if (q && !t.title.toLowerCase().includes(q) && !(t.description ?? "").toLowerCase().includes(q))
    return false;
  if (f.status !== "all" && t.status !== f.status) return false;
  if (f.priority !== "all" && t.priority !== f.priority) return false;
  switch (f.due) {
    case "overdue":
      return isOverdue(t, today);
    case "today":
      return t.due_date === today;
    case "week":
      return !!t.due_date && t.due_date >= today && t.due_date <= addDays(today, 7);
    case "none":
      return !t.due_date;
    default:
      return true;
  }
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function sortTasks(tasks: Task[], key: SortKey) {
  const list = [...tasks];
  const created = (t: Task) => new Date(t.created_at).getTime();
  switch (key) {
    case "oldest":
      return list.sort((a, b) => created(a) - created(b) || a.id - b.id);
    case "due":
      return list.sort((a, b) => {
        if (a.due_date === b.due_date) return created(b) - created(a);
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date < b.due_date ? -1 : 1;
      });
    case "priority":
      return list.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || created(b) - created(a),
      );
    default:
      return list.sort((a, b) => created(b) - created(a) || b.id - a.id);
  }
}

export function visibleTasks(tasks: Task[], view: View, f: TaskFilters, sort: SortKey, today: string) {
  return sortTasks(
    tasks.filter((t) => inView(t, view, today) && matchesFilters(t, f, today)),
    sort,
  );
}

export function computeStats(tasks: Task[], today: string) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const byPriority = { high: 0, medium: 0, low: 0 } as Record<Priority, number>;
  for (const t of tasks) if (t.status === "pending") byPriority[t.priority]++;
  return {
    total,
    completed,
    pending: total - completed,
    overdue: tasks.filter((t) => isOverdue(t, today)).length,
    today: tasks.filter((t) => inView(t, "today", today)).length,
    upcoming: tasks.filter((t) => inView(t, "upcoming", today)).length,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    byPriority,
  };
}
