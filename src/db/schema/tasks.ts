import { boolean, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;

export const createTaskSchema = createInsertSchema(task, {
  title: (schema) => schema.min(1, "Title is required"),
  priority: z.enum(TaskPriority).optional(),
}).omit({ userId: true });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
