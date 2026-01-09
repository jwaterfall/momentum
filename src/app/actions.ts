"use server";

import { revalidatePath } from "next/cache";
import { asc, desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";

import {
  GoalTargetType,
  GoalTargetUnit,
  Period,
  TaskPriority,
  goalLogs,
  goals,
  tasks,
} from "@/db/schema";
import { db } from "@/lib/db";

export async function getGoals(limit: number = 10) {
  const results = await db
    .select({
      ...getTableColumns(goals),
      progress: sql<number>`CAST(COALESCE((
        SELECT SUM(value)
        FROM goal_logs
        WHERE goal_id = goals.id
        AND date >= CASE
          WHEN period = 'daily'   THEN date_trunc('day', now())
          WHEN period = 'weekly'  THEN date_trunc('week', now())
          WHEN period = 'monthly' THEN date_trunc('month', now())
          WHEN period = 'yearly'  THEN date_trunc('year', now())
          ELSE date_trunc('week', now())
        END
      ), 0) AS FLOAT)`,
    })
    .from(goals)
    .where(eq(goals.archived, false))
    .limit(limit);

  return results;
}

export async function createGoal(formData: FormData) {
  const title = formData.get("title") as string;
  const period = (formData.get("period") as Period) || Period.Weekly;
  const targetType = formData.get("targetType") as GoalTargetType;
  const targetUnit = formData.get("targetUnit") as GoalTargetUnit;
  const targetValue = parseInt(formData.get("targetValue") as string);

  await db.insert(goals).values({
    title,
    period,
    targetType,
    targetUnit,
    targetValue,
  });

  revalidatePath("/");
}

export async function logGoalProgress(goalId: number, value: number = 1) {
  await db.insert(goalLogs).values({
    goalId,
    value: value.toString(),
  });

  revalidatePath("/");
}

export async function getTasks(limit: number = 10) {
  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.completed, false))
    .orderBy(asc(tasks.priority), desc(tasks.createdAt))
    .limit(limit);
}

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string;
  await db.insert(tasks).values({
    title,
    priority: formData.get("priority") as TaskPriority,
  });

  revalidatePath("/");
}

export async function completeTask(id: number) {
  await db
    .update(tasks)
    .set({
      completed: true,
      completedAt: new Date(),
    })
    .where(eq(tasks.id, id));

  revalidatePath("/");
}
