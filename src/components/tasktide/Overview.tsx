import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import type { computeStats } from "@/lib/tasks/filters";
import { cn } from "@/lib/utils";

type Stats = ReturnType<typeof computeStats>;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function Overview({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total tasks", value: stats.total, icon: ListTodo, tone: "text-primary" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, tone: "text-success" },
    { label: "Pending", value: stats.pending, icon: Clock, tone: "text-low" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, tone: "text-high" },
  ];
  const maxP = Math.max(1, stats.byPriority.high, stats.byPriority.medium, stats.byPriority.low);
  const summary =
    stats.total === 0
      ? "Your workspace is clear. Add your first task to get going."
      : `${stats.pending} open ${stats.pending === 1 ? "task" : "tasks"}, ${stats.today} due today${
          stats.overdue ? ` and ${stats.overdue} overdue` : ""
        }.`;

  return (
    <section aria-labelledby="overview-heading" className="space-y-5">
      <div className="surface bg-hero p-6 sm:p-8">
        <h2 id="overview-heading" className="text-2xl font-bold sm:text-3xl">{greeting()}.</h2>
        <p className="mt-1 text-muted-foreground">{summary}</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <li key={label} className="surface p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {label}
              <Icon className={cn("size-4", tone)} aria-hidden />
            </div>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums">{value}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="surface p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold">Completion</h3>
            <span className="font-display text-2xl font-bold tabular-nums">{stats.completionRate}%</span>
          </div>
          <div
            className="mt-4 h-3 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Tasks completed"
            aria-valuenow={stats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-success transition-[width] duration-500" style={{ width: `${stats.completionRate}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {stats.completed} of {stats.total} tasks done
          </p>
        </div>
        <div className="surface p-5">
          <h3 className="font-semibold">Open tasks by priority</h3>
          <dl className="mt-4 space-y-3">
            {(["high", "medium", "low"] as const).map((p) => (
              <div key={p} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 text-sm">
                <dt className="capitalize text-muted-foreground">{p}</dt>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-500", `bg-${p}`)}
                    style={{ width: `${(stats.byPriority[p] / maxP) * 100}%` }}
                  />
                </div>
                <dd className="text-right font-semibold tabular-nums">{stats.byPriority[p]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
