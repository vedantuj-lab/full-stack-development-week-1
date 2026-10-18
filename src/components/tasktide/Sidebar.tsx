import { CalendarClock, CalendarDays, CheckCircle2, LayoutDashboard, ListTodo, Settings, Waves } from "lucide-react";
import type { View } from "@/lib/tasks/filters";
import { cn } from "@/lib/utils";

export const NAV: { view: View; label: string; icon: typeof ListTodo }[] = [
  { view: "overview", label: "Overview", icon: LayoutDashboard },
  { view: "all", label: "All Tasks", icon: ListTodo },
  { view: "today", label: "Today", icon: CalendarDays },
  { view: "upcoming", label: "Upcoming", icon: CalendarClock },
  { view: "completed", label: "Completed", icon: CheckCircle2 },
  { view: "settings", label: "Settings", icon: Settings },
];

interface Props {
  view: View;
  counts: Partial<Record<View, number>>;
  onNavigate: (v: View) => void;
}

export function Sidebar({ view, counts, onNavigate }: Props) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lift">
          <Waves className="size-5" aria-hidden />
        </span>
        <span className="font-display text-xl font-bold tracking-tight">TaskTide</span>
      </div>
      <nav aria-label="Main">
        <ul className="space-y-1">
          {NAV.map(({ view: v, label, icon: Icon }) => {
            const active = v === view;
            return (
              <li key={v}>
                <button
                  type="button"
                  onClick={() => onNavigate(v)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="flex-1 text-left">{label}</span>
                  {counts[v] !== undefined && (
                    <span className="rounded-md bg-background/60 px-1.5 py-0.5 text-xs tabular-nums">{counts[v]}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="mt-auto px-2 text-xs text-muted-foreground">Single-workspace demo · data stored in the cloud</p>
    </aside>
  );
}

export function BottomNav({ view, counts, onNavigate }: Props) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-glass backdrop-blur-lg md:hidden"
    >
      <ul className="grid grid-cols-6">
        {NAV.map(({ view: v, label, icon: Icon }) => {
          const active = v === view;
          return (
            <li key={v}>
              <button
                type="button"
                onClick={() => onNavigate(v)}
                aria-current={active ? "page" : undefined}
                aria-label={counts[v] !== undefined ? `${label} (${counts[v]})` : label}
                className={cn(
                  "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="max-w-full truncate px-0.5">{label.replace(" Tasks", "")}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
