import { and, count, eq, sql } from "drizzle-orm";
import "server-only";

import { streakLog, task } from "@/db/schema";
import { getGoals } from "@/features/goals/services";
import { getStreaks } from "@/features/streaks/services";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

export type ChartPoint = { label: string; value: number };

export type Stats = {
  summary: {
    activeGoals: number;
    openTasks: number;
    activeStreaks: number;
    tasksCompletedThisWeek: number;
  };
  goals: { onTarget: number; total: number; chart: ChartPoint[] };
  tasks: { open: number; completed: number; chart: ChartPoint[] };
  streaks: {
    total: number;
    longestCurrentDays: number;
    slipsThisWeek: number;
    chart: ChartPoint[];
  };
};

function completedByDay(rows: { day: string; value: number }[]): ChartPoint[] {
  const counts = new Map(rows.map((r) => [r.day, r.value]));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const key = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      value: counts.get(key) ?? 0,
    };
  });
}

export async function getStats(): Promise<Stats> {
  const userId = await getUserId();

  const [goals, streaks, taskCountRows, completionRows, slipRows] = await Promise.all([
    getGoals(100),
    getStreaks(100),
    db
      .select({
        open: sql<number>`CAST(COUNT(*) FILTER (WHERE ${task.completed} = false) AS INTEGER)`,
        completed: sql<number>`CAST(COUNT(*) FILTER (WHERE ${task.completed} = true) AS INTEGER)`,
        thisWeek: sql<number>`CAST(COUNT(*) FILTER (WHERE ${task.completed} = true AND ${task.completedAt} >= date_trunc('week', now())) AS INTEGER)`,
      })
      .from(task)
      .where(eq(task.userId, userId)),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${task.completedAt}), 'YYYY-MM-DD')`,
        value: count(),
      })
      .from(task)
      .where(
        and(
          eq(task.userId, userId),
          eq(task.completed, true),
          sql`${task.completedAt} >= now() - interval '7 days'`,
        ),
      )
      .groupBy(sql`date_trunc('day', ${task.completedAt})`),
    db
      .select({ value: count() })
      .from(streakLog)
      .where(
        and(eq(streakLog.userId, userId), sql`${streakLog.date} >= date_trunc('week', now())`),
      ),
  ]);

  const taskRow = taskCountRows[0];

  return {
    summary: {
      activeGoals: goals.length,
      openTasks: taskRow.open,
      activeStreaks: streaks.length,
      tasksCompletedThisWeek: taskRow.thisWeek,
    },
    goals: {
      onTarget: goals.filter((goal) => goal.progress >= goal.targetValue).length,
      total: goals.length,
      chart: goals.map((goal) => ({
        label: goal.title,
        value:
          goal.targetValue > 0
            ? Math.min(Math.round((goal.progress / goal.targetValue) * 100), 100)
            : 0,
      })),
    },
    tasks: {
      open: taskRow.open,
      completed: taskRow.completed,
      chart: completedByDay(completionRows),
    },
    streaks: {
      total: streaks.length,
      longestCurrentDays: streaks.reduce(
        (max, streak) => Math.max(max, streak.currentStreakDays),
        0,
      ),
      slipsThisWeek: slipRows[0]?.value ?? 0,
      chart: streaks.map((streak) => ({ label: streak.title, value: streak.currentStreakDays })),
    },
  };
}
