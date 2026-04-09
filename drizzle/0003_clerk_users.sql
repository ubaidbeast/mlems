CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"clerkId" text NOT NULL,
	"firstName" text,
	"lastName" text,
	"email" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerkId_unique" ON "users" USING btree ("clerkId");