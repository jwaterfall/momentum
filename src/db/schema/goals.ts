import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { user } from "./auth";

export enum Period {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

export const periodEnum = pgEnum("period", Period);

export enum GoalTargetType {
  Count = "count",
  Duration = "duration",
}

export const goalTargetTypeEnum = pgEnum("goal_target_type", GoalTargetType);

export enum GoalTargetUnit {
  Minutes = "minutes",
  Hours = "hours",
}

export const goalTargetUnitEnum = pgEnum("goal_target_unit", GoalTargetUnit);

export const goal = pgTable("goal", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  period: periodEnum("period").default(Period.Weekly).notNull(),
  targetValue: integer("target_value").notNull(),
  targetType: goalTargetTypeEnum("target_type").default(GoalTargetType.Count),
  targetUnit: goalTargetUnitEnum("target_unit"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  archived: boolean("archived").default(false),
});

export const goalLog = pgTable("goal_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  goalId: integer("goal_id").references(() => goal.id, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).defaultNow(),
  value: decimal("value").notNull(),
});

export type Goal = typeof goal.$inferSelect;
export type NewGoal = typeof goal.$inferInsert;

export type GoalLog = typeof goalLog.$inferSelect;
export type NewGoalLog = typeof goalLog.$inferInsert;

export const createGoalSchema = createInsertSchema(goal, {
  title: (schema) => schema.min(1, "Title is required"),
  targetValue: z.coerce.number<number>().min(1, "Target must be at least 1"),
  period: z.enum(Period),
  targetType: z.enum(GoalTargetType).optional(),
  targetUnit: z.enum(GoalTargetUnit).optional(),
}).omit({ userId: true });

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
