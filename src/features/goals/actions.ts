"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { goal, goalLog } from "@/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

import type { GoalFormInput } from "./components/goal-form-dialog";

export async function createGoal(input: GoalFormInput) {
  const userId = await getUserId();
  await db.insert(goal).values({ ...input, userId });
  revalidatePath("/");
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
