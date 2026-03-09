"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, asc, desc, eq, getTableColumns, sql } from "drizzle-orm";

import type { GoalFormInput } from "@/components/GoalFormDialog";
import type { TaskFormInput } from "@/components/TaskFormDialog";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { goal, goalLog, task } from "../db/schema";

async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

export async function getGoals(limit: number = 10) {
  const userId = await getUserId();

  const results = await db
    .select({
      ...getTableColumns(goal),
      progress: sql<number>`CAST(COALESCE((
        SELECT SUM(value)
        FROM goal_log
        WHERE goal_id = ${goal.id}
        AND user_id = ${sql.raw(`'${userId}'`)}
        AND date >= CASE
          WHEN ${goal.period}::text = 'daily'   THEN date_trunc('day', now())
          WHEN ${goal.period}::text = 'weekly'  THEN date_trunc('week', now())
          WHEN ${goal.period}::text = 'monthly' THEN date_trunc('month', now())
          WHEN ${goal.period}::text = 'yearly'  THEN date_trunc('year', now())
          ELSE date_trunc('week', now())
        END
      ), 0) AS FLOAT)`,
    })
    .from(goal)
    .where(and(eq(goal.userId, userId), eq(goal.archived, false)))
    .limit(limit);

  return results;
}

export async function createGoal(input: GoalFormInput) {
  try {
    const userId = await getUserId();
    await db.insert(goal).values({ ...input, userId });
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating goal:", error);
    throw error;
  }
}

export async function logGoalProgress(goalId: number, value: number = 1) {
  const userId = await getUserId();

  const goalRecord = await db
    .select()
    .from(goal)
    .where(and(eq(goal.id, goalId), eq(goal.userId, userId)))
    .limit(1);

  if (goalRecord.length === 0) {
    throw new Error("Goal not found");
  }

  await db.insert(goalLog).values({
    goalId,
    userId,
    value: value.toString(),
  });

  revalidatePath("/");
}

export async function updateGoal(id: number, input: GoalFormInput) {
  const userId = await getUserId();

  await db
    .update(goal)
    .set(input)
    .where(and(eq(goal.id, id), eq(goal.userId, userId)));

  revalidatePath("/");
}

export async function deleteGoal(id: number) {
  const userId = await getUserId();

  await db.delete(goal).where(and(eq(goal.id, id), eq(goal.userId, userId)));

  revalidatePath("/");
}

export async function getTasks(limit: number = 10) {
  const userId = await getUserId();

  return await db
    .select()
    .from(task)
    .where(and(eq(task.userId, userId), eq(task.completed, false)))
    .orderBy(asc(task.priority), desc(task.createdAt))
    .limit(limit);
}

export async function createTask(input: TaskFormInput) {
  try {
    const userId = await getUserId();
    await db.insert(task).values({ ...input, userId });
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

export async function completeTask(id: number) {
  const userId = await getUserId();

  await db
    .update(task)
    .set({
      completed: true,
      completedAt: new Date(),
    })
    .where(and(eq(task.id, id), eq(task.userId, userId)));

  revalidatePath("/");
}

export async function updateTask(id: number, input: TaskFormInput) {
  const userId = await getUserId();

  await db
    .update(task)
    .set(input)
    .where(and(eq(task.id, id), eq(task.userId, userId)));

  revalidatePath("/");
}

export async function deleteTask(id: number) {
  const userId = await getUserId();

  await db.delete(task).where(and(eq(task.id, id), eq(task.userId, userId)));

  revalidatePath("/");
}
