ALTER TABLE "auction_settings" DROP CONSTRAINT "auction_settings_user_id_unique";--> statement-breakpoint
ALTER TABLE "auction_settings" DROP CONSTRAINT "auction_settings_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "auction_settings" ADD COLUMN "auction_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "auction_settings" ADD CONSTRAINT "auction_settings_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_settings" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "auction_settings" DROP COLUMN "min_bid_increment";--> statement-breakpoint
ALTER TABLE "auction_settings" DROP COLUMN "reserve_price";--> statement-breakpoint
ALTER TABLE "auction_settings" DROP COLUMN "buy_now_price";--> statement-breakpoint
ALTER TABLE "auction_settings" ADD CONSTRAINT "auction_settings_auction_id_unique" UNIQUE("auction_id");