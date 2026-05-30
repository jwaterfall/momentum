import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatBarChart } from "@/features/stats/components/bar-chart";
import { StatTile } from "@/features/stats/components/stat-tile";
import { getStats } from "@/features/stats/services";
import { requirePageAuth } from "@/utils/require-page-auth";

export default async function StatsPage() {
  await requirePageAuth();
  const stats = await getStats();

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Stats" description="How your goals, tasks, and streaks are trending" />

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Active goals" value={stats.summary.activeGoals} />
        <StatTile label="Open tasks" value={stats.summary.openTasks} />
        <StatTile label="Active streaks" value={stats.summary.activeStreaks} />
        <StatTile label="Done this week" value={stats.summary.tasksCompletedThisWeek} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-heading font-semibold text-foreground">Goals</h2>
        {stats.goals.total === 0 ? (
          <EmptyState>No goals to report on yet.</EmptyState>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Progress this period</CardTitle>
              <CardDescription>
                {stats.goals.onTarget} of {stats.goals.total} on target
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatBarChart data={stats.goals.chart} valueLabel="Progress %" layout="vertical" />
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-heading font-semibold text-foreground">Tasks</h2>
        {stats.tasks.open === 0 && stats.tasks.completed === 0 ? (
          <EmptyState>No tasks to report on yet.</EmptyState>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Completed last 7 days</CardTitle>
              <CardDescription>
                {stats.tasks.open} open · {stats.tasks.completed} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatBarChart data={stats.tasks.chart} valueLabel="Completed" />
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-heading font-semibold text-foreground">Streaks</h2>
        {stats.streaks.total === 0 ? (
          <EmptyState>No streaks to report on yet.</EmptyState>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Current streaks</CardTitle>
              <CardDescription>
                Longest {stats.streaks.longestCurrentDays} days · {stats.streaks.slipsThisWeek}{" "}
                slips this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatBarChart data={stats.streaks.chart} valueLabel="Days" layout="vertical" />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
