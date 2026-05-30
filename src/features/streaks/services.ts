import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import "server-only";

import { Streak, streak } from "@/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/utils/get-user-id";

export type StreakWithStats = Streak & {
  totalSlips: number;
  lastSlipAt: Date | null;
  currentStreakDays: number;
};

const MS_PER_DAY = 86_400_000;

export async function getStreaks(limit: number = 10): Promise<StreakWithStats[]> {
  const userId = await getUserId();

  const rows = await db
    .select({
      ...getTableColumns(streak),
      totalSlips: sql<number>`CAST((
        SELECT COUNT(*) FROM streak_log sl
        WHERE sl.streak_id = streak.id AND sl.user_id = ${userId}
      ) AS INTEGER)`,
      lastSlipAt: sql<Date | null>`(
        SELECT MAX(sl.date) FROM streak_log sl
        WHERE sl.streak_id = streak.id AND sl.user_id = ${userId}
      )`,
    })
    .from(streak)
    .where(and(eq(streak.userId, userId), eq(streak.archived, false)))
    .orderBy(desc(streak.createdAt))
    .limit(limit);

  return rows.map((row) => {
    const since = row.lastSlipAt ?? row.createdAt;
    const currentStreakDays = since
      ? Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / MS_PER_DAY))
      : 0;
    return { ...row, currentStreakDays };
  });
}
