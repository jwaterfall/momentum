import { and, desc, eq } from "drizzle-orm";
import "server-only";

import {
  GoalTargetType,
  GoalTargetUnit,
  goal,
  goalLog,
  streak,
  streakLog,
  task,
} from "@/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

export type HistoryEntry = {
  kind: "goal" | "streak" | "task";
  id: number;
  title: string;
  label: string;
  date: Date | null;
};

function formatGoalLog(
  value: string,
  targetType: GoalTargetType | null,
  targetUnit: GoalTargetUnit | null,
): string {
  const amount = Number(value);
  if (targetType === GoalTargetType.Duration) {
    return `Logged +${amount}${targetUnit ? ` ${targetUnit}` : ""}`;
  }
  return `Logged +${amount}`;
}

export async function getHistory(limit: number = 50): Promise<HistoryEntry[]> {
  const userId = await getUserId();

  const [goalLogs, slips, completedTasks] = await Promise.all([
    db
      .select({
        id: goalLog.id,
        title: goal.title,
        value: goalLog.value,
        targetType: goal.targetType,
        targetUnit: goal.targetUnit,
        date: goalLog.date,
      })
      .from(goalLog)
      .innerJoin(goal, eq(goalLog.goalId, goal.id))
      .where(eq(goalLog.userId, userId))
      .orderBy(desc(goalLog.date))
      .limit(limit),
    db
      .select({ id: streakLog.id, title: streak.title, date: streakLog.date })
      .from(streakLog)
      .innerJoin(streak, eq(streakLog.streakId, streak.id))
      .where(eq(streakLog.userId, userId))
      .orderBy(desc(streakLog.date))
      .limit(limit),
    db
      .select({ id: task.id, title: task.title, date: task.completedAt })
      .from(task)
      .where(and(eq(task.userId, userId), eq(task.completed, true)))
      .orderBy(desc(task.completedAt))
      .limit(limit),
  ]);

  const entries: HistoryEntry[] = [
    ...goalLogs.map((row) => ({
      kind: "goal" as const,
      id: row.id,
      title: row.title,
      label: formatGoalLog(row.value, row.targetType, row.targetUnit),
      date: row.date,
    })),
    ...slips.map((row) => ({
      kind: "streak" as const,
      id: row.id,
      title: row.title,
      label: "Slip logged",
      date: row.date,
    })),
    ...completedTasks.map((row) => ({
      kind: "task" as const,
      id: row.id,
      title: row.title,
      label: "Completed",
      date: row.date,
    })),
  ];

  return entries
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .slice(0, limit);
}
