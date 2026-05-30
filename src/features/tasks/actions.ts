"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { task } from "@/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

import type { TaskFormInput } from "./components/task-form-dialog";

export async function createTask(input: TaskFormInput) {
  const userId = await getUserId();
  await db.insert(task).values({ ...input, userId });
  revalidatePath("/");
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
