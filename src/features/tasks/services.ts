import { and, asc, desc, eq } from "drizzle-orm";
import "server-only";

import { Task, task } from "@/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

export async function getTasks(limit: number = 10): Promise<Task[]> {
  const userId = await getUserId();

  return db
    .select()
    .from(task)
    .where(and(eq(task.userId, userId), eq(task.completed, false)))
    .orderBy(asc(task.priority), desc(task.createdAt))
    .limit(limit);
}
