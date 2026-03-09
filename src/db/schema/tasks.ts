import { boolean, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export enum TaskPriority {
  High = "high",
  Normal = "normal",
  Low = "low",
}

export const taskPriorityEnum = pgEnum("task_priority", TaskPriority);

export const task = pgTable("task", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  priority: taskPriorityEnum("priority").default(TaskPriority.Normal),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;
