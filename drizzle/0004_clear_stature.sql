ALTER TABLE "users" ADD COLUMN "department" text;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_accounts_id_fk" FOREIGN KEY ("department") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;