"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, asc, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { CreateGoalInput, CreateTaskInput, goal, goalLog, task } from "../db/schema";

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

export async function createGoal(input: CreateGoalInput) {
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

  // Verify the goal belongs to the user
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

export async function getTasks(limit: number = 10) {
  const userId = await getUserId();

  return await db
    .select()
    .from(task)
    .where(and(eq(task.userId, userId), eq(task.completed, false)))
    .orderBy(asc(task.priority), desc(task.createdAt))
    .limit(limit);
}

export async function createTask(input: CreateTaskInput) {
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
