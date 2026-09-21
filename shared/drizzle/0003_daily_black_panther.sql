CREATE TABLE "auction_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"min_bid_increment" numeric(12, 2) NOT NULL,
	"reserve_price" numeric(12, 2),
	"buy_now_price" numeric(12, 2),
	"auto_extend_enabled" boolean DEFAULT false NOT NULL,
	"auto_extend_minutes" integer,
	"max_bids_per_user" integer,
	"require_verified_bidder" boolean DEFAULT false NOT NULL,
	"custom_rules" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auction_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "auction_settings" ADD CONSTRAINT "auction_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;