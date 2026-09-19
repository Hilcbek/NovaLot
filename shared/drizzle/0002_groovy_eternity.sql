CREATE TYPE "public"."auction_status" AS ENUM('draft', 'scheduled', 'active', 'ended', 'cancelled');--> statement-breakpoint
CREATE TABLE "auction_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auction_id" uuid NOT NULL,
	"file_id" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auctions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"category_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"starting_price" numeric(12, 2) NOT NULL,
	"current_price" numeric(12, 2) NOT NULL,
	"reserve_price" numeric(12, 2),
	"buy_now_price" numeric(12, 2),
	"bid_increment" numeric(12, 2) NOT NULL,
	"location" text NOT NULL,
	"condition" text NOT NULL,
	"status" "auction_status" DEFAULT 'draft' NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auctions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "auction_images" ADD CONSTRAINT "auction_images_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auction_images_auction_id_idx" ON "auction_images" USING btree ("auction_id");--> statement-breakpoint
CREATE INDEX "auctions_category_id_idx" ON "auctions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "auctions_seller_id_idx" ON "auctions" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "auctions_status_idx" ON "auctions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "auctions_end_time_idx" ON "auctions" USING btree ("end_time");