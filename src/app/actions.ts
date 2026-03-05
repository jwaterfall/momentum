"use server";

import { revalidatePath } from "next/cache";
import { asc, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { CreateGoalInput, CreateTaskInput, goalLog, goal, task } from "../db/schema";
import { db } from "@/lib/db";

export async function getGoals(limit: number = 10) {
  const results = await db
    .select({
      ...getTableColumns(goal),
      progress: sql<number>`CAST(COALESCE((
        SELECT SUM(value)
        FROM goal_log
        WHERE goal_id = goal.id
        AND date >= CASE
          WHEN period = 'daily'   THEN date_trunc('day', now())
          WHEN period = 'weekly'  THEN date_trunc('week', now())
          WHEN period = 'monthly' THEN date_trunc('month', now())
          WHEN period = 'yearly'  THEN date_trunc('year', now())
          ELSE date_trunc('week', now())
        END
      ), 0) AS FLOAT)`,
    })
    .from(goal)
    .where(eq(goal.archived, false))
    .limit(limit);

  return results;
}

export async function createGoal(input: CreateGoalInput) {
  await db.insert(goal).values(input);
  revalidatePath("/");
}

export async function logGoalProgress(goalId: number, value: number = 1) {
  await db.insert(goalLog).values({
    goalId,
    value: value.toString(),
  });

  revalidatePath("/");
}

export async function getTasks(limit: number = 10) {
  return await db
    .select()
    .from(task)
    .where(eq(task.completed, false))
    .orderBy(asc(task.priority), desc(task.createdAt))
    .limit(limit);
}

export async function createTask(input: CreateTaskInput) {
  await db.insert(task).values(input);
  revalidatePath("/");
}

export async function completeTask(id: number) {
  await db
    .update(task)
    .set({
      completed: true,
      completedAt: new Date(),
    })
    .where(eq(task.id, id));

  revalidatePath("/");
}
