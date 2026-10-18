import { AlertTriangle, Calendar, Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isOverdue } from "@/lib/tasks/filters";
import type { Priority, Task } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

const PRIORITY_STYLE: Record<Priority, { label: string; bar: string; chip: string }> = {
  high: { label: "High", bar: "bg-high", chip: "bg-high/15 text-high" },
  medium: { label: "Medium", bar: "bg-medium", chip: "bg-medium/15 text-medium" },
  low: { label: "Low", bar: "bg-low", chip: "bg-low/15 text-low" },
};

export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  task: Task;
  today: string;
  busy: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, today, busy, onEdit, onToggle, onDelete }: Props) {
  const p = PRIORITY_STYLE[task.priority];
  const done = task.status === "completed";
  const overdue = isOverdue(task, today);

  return (
    <article
      className={cn(
        "surface group relative flex flex-col gap-3 overflow-hidden p-4 pl-5 transition-shadow animate-rise hover:shadow-lift sm:flex-row sm:items-start",
        done && "opacity-70",
      )}
      aria-labelledby={`task-${task.id}-title`}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", p.bar)} aria-hidden />
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        aria-label={done ? `Reopen “${task.title}”` : `Mark “${task.title}” as complete`}
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors disabled:opacity-50",
          done ? "border-success bg-success text-background" : "border-input hover:border-primary",
        )}
      >
        {done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          id={`task-${task.id}-title`}
          className={cn("break-words text-base font-semibold", done && "line-through decoration-2")}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 whitespace-pre-line break-words text-sm text-muted-foreground">{task.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={cn("rounded-full px-2 py-0.5 font-semibold", p.chip)}>{p.label} priority</span>
          {task.due_date && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                overdue ? "bg-destructive/15 font-semibold text-destructive" : "bg-muted text-muted-foreground",
              )}
            >
              {overdue ? <AlertTriangle className="size-3" aria-hidden /> : <Calendar className="size-3" aria-hidden />}
              {overdue ? "Overdue · " : "Due "}
              {formatDate(task.due_date)}
            </span>
          )}
          {done && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success">
              Completed{task.completed_at ? ` ${formatDate(task.completed_at)}` : ""}
            </span>
          )}
          <span className="text-muted-foreground">Created {formatDate(task.created_at)}</span>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 sm:opacity-70 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Button variant="ghost" size="sm" onClick={onToggle} disabled={busy}>
          {done ? <RotateCcw aria-hidden /> : <Check aria-hidden />}
          {done ? "Reopen" : "Complete"}
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit} disabled={busy} aria-label={`Edit “${task.title}”`}>
          <Pencil aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={busy}
          aria-label={`Delete “${task.title}”`}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 aria-hidden />
        </Button>
      </div>
    </article>
  );
}
