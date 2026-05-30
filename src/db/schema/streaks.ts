import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const streak = pgTable("streak", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  archived: boolean("archived").default(false),
});

export const streakLog = pgTable("streak_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  streakId: integer("streak_id").references(() => streak.id, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).defaultNow(),
});

export type Streak = typeof streak.$inferSelect;
export type NewStreak = typeof streak.$inferInsert;

export type StreakLog = typeof streakLog.$inferSelect;
export type NewStreakLog = typeof streakLog.$inferInsert;
