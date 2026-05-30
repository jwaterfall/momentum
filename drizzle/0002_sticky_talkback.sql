CREATE TABLE "streak" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"archived" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "streak_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"streak_id" integer,
	"date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "streak" ADD CONSTRAINT "streak_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_log" ADD CONSTRAINT "streak_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_log" ADD CONSTRAINT "streak_log_streak_id_streak_id_fk" FOREIGN KEY ("streak_id") REFERENCES "public"."streak"("id") ON DELETE cascade ON UPDATE no action;
