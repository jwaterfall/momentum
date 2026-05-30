import { AddGoalDialog } from "@/components/AddGoalDialog";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { DailyQuote } from "@/components/DailyQuote";
import { GoalCard } from "@/components/GoalCard";
import { TaskCard } from "@/components/TaskCard";
import { requirePageAuth } from "@/utils/require-page-auth";

import { getGoals, getTasks } from "../actions";

export default async function Home() {
  await requirePageAuth();
  const [goals, tasks] = await Promise.all([getGoals(), getTasks()]);

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-heading font-semibold text-foreground">Momentum</h1>
        <p className="text-muted-foreground text-sm">Your personal growth dashboard</p>
      </header>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold text-foreground">Goals</h2>
          <AddGoalDialog />
        </div>
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
              No goals yet.
            </div>
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
          <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
            No tasks yet.
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </section>
      <DailyQuote />
    </div>
  );
}
