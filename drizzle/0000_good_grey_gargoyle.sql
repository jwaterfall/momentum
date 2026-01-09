CREATE TYPE "public"."goal_target_type" AS ENUM('count', 'duration');--> statement-breakpoint
CREATE TYPE "public"."goal_target_unit" AS ENUM('minutes', 'hours');--> statement-breakpoint
CREATE TYPE "public"."period" AS ENUM('daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('high', 'normal', 'low');--> statement-breakpoint
CREATE TABLE "goal_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"goal_id" integer,
	"date" timestamp DEFAULT now(),
	"value" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"period" "period" DEFAULT 'weekly' NOT NULL,
	"target_value" integer NOT NULL,
	"target_type" "goal_target_type" DEFAULT 'count',
	"target_unit" "goal_target_unit",
	"created_at" timestamp DEFAULT now(),
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"archived" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false,
	"priority" "task_priority" DEFAULT 'normal',
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"tags" text
);
--> statement-breakpoint
ALTER TABLE "goal_logs" ADD CONSTRAINT "goal_logs_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;