import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/tasks/api";
import { PRIORITIES, type Priority, type Status, type Task, type TaskInput } from "@/lib/tasks/types";
import { validateTaskInput } from "@/lib/tasks/validation";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: TaskInput) => Promise<void>;
}

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TaskDialog({ open, task, onOpenChange, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("pending");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setDueDate(task?.due_date ?? "");
    setPriority(task?.priority ?? "medium");
    setStatus(task?.status ?? "pending");
    setErrors({});
    setFormError("");
  }, [open, task]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    const input: TaskInput = {
      title,
      description: description || null,
      due_date: dueDate || null,
      priority,
      ...(task ? { status } : {}),
    };
    const v = validateTaskInput(input);
    if (!v.ok) {
      setErrors(v.errors);
      return;
    }
    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      await onSubmit(input);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.details);
      setFormError(err instanceof Error ? err.message : "Could not save the task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details and save your changes." : "Capture what needs doing. Only a title is required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              autoFocus
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "task-title-error" : undefined}
              placeholder="e.g. Draft the quarterly report"
            />
            {errors.title && (
              <p id="task-title-error" className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              aria-invalid={!!errors.description}
              placeholder="Optional notes"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <div className={cn("grid gap-4", task ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-invalid={!!errors.due_date} />
              {errors.due_date && <p className="text-sm text-destructive">{errors.due_date}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <select id="task-priority" className={selectClass} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            {task && (
              <div className="space-y-1.5">
                <Label htmlFor="task-status">Status</Label>
                <select id="task-status" className={selectClass} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>
          {formError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
          )}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" aria-hidden />}
              {task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
