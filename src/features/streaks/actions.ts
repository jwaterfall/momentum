"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { streak, streakLog } from "@/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

import type { StreakFormInput } from "./components/streak-form-dialog";

export async function createStreak(input: StreakFormInput) {
  const userId = await getUserId();
  await db.insert(streak).values({ ...input, userId });
  revalidatePath("/");
}

export async function logSlip(streakId: number) {
  const userId = await getUserId();

  const streakRecord = await db
    .select()
    .from(streak)
    .where(and(eq(streak.id, streakId), eq(streak.userId, userId)))
    .limit(1);

  if (streakRecord.length === 0) {
    throw new Error("Streak not found");
  }

  await db.insert(streakLog).values({ streakId, userId });

  revalidatePath("/");
}

export async function updateStreak(id: number, input: StreakFormInput) {
  const userId = await getUserId();

  await db
    .update(streak)
    .set(input)
    .where(and(eq(streak.id, id), eq(streak.userId, userId)));

  revalidatePath("/");
}

export async function deleteStreak(id: number) {
  const userId = await getUserId();

  await db.delete(streak).where(and(eq(streak.id, id), eq(streak.userId, userId)));

  revalidatePath("/");
}
