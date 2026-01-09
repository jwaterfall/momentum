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

export enum TaskPriority {
  High = "high",
  Normal = "normal",
  Low = "low",
}

export const taskPriorityEnum = pgEnum("task_priority", TaskPriority);

export const goals = pgTable("goals", {
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

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export const goalLogs = pgTable("goal_logs", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => goals.id),
  date: timestamp("date").defaultNow(),
  value: decimal("value").notNull(),
});

export type GoalLog = typeof goalLogs.$inferSelect;
export type NewGoalLog = typeof goalLogs.$inferInsert;

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  priority: taskPriorityEnum("priority").default(TaskPriority.Normal),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  tags: text("tags"),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
