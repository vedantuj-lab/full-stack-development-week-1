export const PRIORITIES = ["low", "medium", "high"] as const;
export const STATUSES = ["pending", "completed"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  status?: Status;
  due_date?: string | null;
}
