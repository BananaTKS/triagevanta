CREATE TYPE "public"."asset_condition" AS ENUM('new', 'good', 'fair', 'poor');--> statement-breakpoint
CREATE TYPE "public"."asset_event_type" AS ENUM('created', 'assigned', 'unassigned', 'status_change', 'updated');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('in_use', 'spare', 'repair', 'retired');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('laptop', 'desktop', 'monitor', 'phone', 'peripheral', 'other');--> statement-breakpoint
CREATE TABLE "asset_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"type" "asset_event_type" NOT NULL,
	"actor_id" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_tag" text NOT NULL,
	"name" text NOT NULL,
	"type" "asset_type" DEFAULT 'laptop' NOT NULL,
	"serial_number" text,
	"status" "asset_status" DEFAULT 'spare' NOT NULL,
	"condition" "asset_condition" DEFAULT 'good' NOT NULL,
	"assigned_to_id" uuid,
	"warranty_expires_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_asset_tag_unique" UNIQUE("asset_tag")
);
--> statement-breakpoint
ALTER TABLE "asset_events" ADD CONSTRAINT "asset_events_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_events" ADD CONSTRAINT "asset_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_events_asset_idx" ON "asset_events" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "assets_status_idx" ON "assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assets_assigned_to_idx" ON "assets" USING btree ("assigned_to_id");