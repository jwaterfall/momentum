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
    title: text("title").notNull(),
    period: periodEnum("period").default(Period.Weekly).notNull(),
    targetValue: integer("target_value").notNull(),
    targetType: goalTargetTypeEnum("target_type").default(GoalTargetType.Count),
    targetUnit: goalTargetUnitEnum("target_unit"),
    createdAt: timestamp("created_at").defaultNow(),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
    archived: boolean("archived").default(false),
});

export const goalLog = pgTable("goal_log", {
    id: serial("id").primaryKey(),
    goalId: integer("goal_id").references(() => goal.id),
    date: timestamp("date").defaultNow(),
    value: decimal("value").notNull(),
});

export type Goal = typeof goal.$inferSelect;
export type NewGoal = typeof goal.$inferInsert;

export type GoalLog = typeof goalLog.$inferSelect;
export type NewGoalLog = typeof goalLog.$inferInsert;

export const createGoalSchema = createInsertSchema(goal, {
    title: (schema) => schema.min(1, "Title is required"),
    targetValue: z.coerce.number().min(1, "Target must be at least 1"),
    period: z.nativeEnum(Period),
    targetType: z.nativeEnum(GoalTargetType).optional(),
    targetUnit: z.nativeEnum(GoalTargetUnit).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
