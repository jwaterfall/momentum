"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { goalLog, streakLog, task } from "@/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

export async function deleteGoalLog(id: number) {
  const userId = await getUserId();
  await db.delete(goalLog).where(and(eq(goalLog.id, id), eq(goalLog.userId, userId)));
  revalidatePath("/");
}

export async function deleteStreakSlip(id: number) {
  const userId = await getUserId();
  await db.delete(streakLog).where(and(eq(streakLog.id, id), eq(streakLog.userId, userId)));
  revalidatePath("/");
}

export async function uncompleteTask(id: number) {
  const userId = await getUserId();
  await db
    .update(task)
    .set({ completed: false, completedAt: null })
    .where(and(eq(task.id, id), eq(task.userId, userId)));
  revalidatePath("/");
}
