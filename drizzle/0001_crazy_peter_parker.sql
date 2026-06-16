CREATE TABLE "kb_article_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"helpful" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kb_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"category" "ticket_category" DEFAULT 'other' NOT NULL,
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kb_article_votes" ADD CONSTRAINT "kb_article_votes_article_id_kb_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."kb_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_article_votes" ADD CONSTRAINT "kb_article_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "kb_votes_article_user_idx" ON "kb_article_votes" USING btree ("article_id","user_id");--> statement-breakpoint
CREATE INDEX "kb_articles_category_idx" ON "kb_articles" USING btree ("category");