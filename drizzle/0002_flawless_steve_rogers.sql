ALTER TABLE "goals" RENAME TO "goal";--> statement-breakpoint
ALTER TABLE "goal_logs" RENAME TO "goal_log";--> statement-breakpoint
ALTER TABLE "tasks" RENAME TO "task";--> statement-breakpoint
ALTER TABLE "goal_log" DROP CONSTRAINT "goal_logs_goal_id_goals_id_fk";
--> statement-breakpoint
ALTER TABLE "goal_log" ADD CONSTRAINT "goal_log_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goal"("id") ON DELETE no action ON UPDATE no action;