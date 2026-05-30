import { DailyQuote } from "@/components/daily-quote";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { AddGoalDialog } from "@/features/goals/components/add-goal-dialog";
import { GoalCard } from "@/features/goals/components/goal-card";
import { getGoals } from "@/features/goals/services";
import { AddTaskDialog } from "@/features/tasks/components/add-task-dialog";
import { TaskCard } from "@/features/tasks/components/task-card";
import { getTasks } from "@/features/tasks/services";
import { requirePageAuth } from "@/utils/require-page-auth";

export default async function Home() {
  await requirePageAuth();
  const [goals, tasks] = await Promise.all([getGoals(), getTasks()]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Momentum" description="Your personal growth dashboard" />
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold text-foreground">Goals</h2>
          <AddGoalDialog />
        </div>
        <div className="space-y-3">
          {goals.length === 0 ? (
            <EmptyState>No goals yet.</EmptyState>
          ) : (
            goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          )}
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold text-foreground">Tasks</h2>
          <AddTaskDialog />
        </div>
        {tasks.length === 0 ? (
          <EmptyState>No tasks yet.</EmptyState>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </section>
      <DailyQuote />
    </div>
  );
}
