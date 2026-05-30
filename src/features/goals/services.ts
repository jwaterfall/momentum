import { and, eq, getTableColumns, sql } from "drizzle-orm";
import "server-only";

import { Goal, goal } from "@/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

export type GoalWithProgress = Goal & {
  progress: number;
};

export async function getGoals(limit: number = 10): Promise<GoalWithProgress[]> {
  const userId = await getUserId();

  return db
    .select({
      ...getTableColumns(goal),
      progress: sql<number>`CAST(COALESCE((
        SELECT SUM(gl.value)
        FROM goal_log gl
        WHERE gl.goal_id = goal.id
        AND gl.user_id = ${userId}
        AND gl.date >= CASE
          WHEN goal.period::text = 'daily'   THEN date_trunc('day', now())
          WHEN goal.period::text = 'weekly'  THEN date_trunc('week', now())
          WHEN goal.period::text = 'monthly' THEN date_trunc('month', now())
          WHEN goal.period::text = 'yearly' THEN date_trunc('year', now())
          ELSE date_trunc('week', now())
        END
      ), 0) AS FLOAT)`,
    })
    .from(goal)
    .where(and(eq(goal.userId, userId), eq(goal.archived, false)))
    .limit(limit);
}
