import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const tokenTypeEnum = pgEnum("token_type", [
  "email_verification",
  "password_reset",
  "email_change",
  "invite",
]);

export const users = pgTable("user", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  password_hash: text("password_hash").notNull(),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
  avatar_url: text("avatar_url"),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    type: tokenTypeEnum("type").notNull(), // "email_verification" | "password_reset"
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // fast lookup path: "find the valid token for this hash"
    tokenHashIdx: index("verification_tokens_token_hash_idx").on(
      table.tokenHash,
    ),
    // fast lookup path: "does this user already have a pending token of this type?"
    userTypeIdx: index("verification_tokens_user_type_idx").on(
      table.userId,
      table.type,
    ),
  }),
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    parentId: uuid("parent_id").references(
      (): AnyPgColumn => categories.id,
      { onDelete: "restrict" }, // DB-level backstop: can't delete a parent while children exist
    ),
    description: text("description"),
    imageUrl: text("image_url"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("categories_parent_id_idx").on(table.parentId),
    index("categories_slug_idx").on(table.slug),
  ],
);

export const auctionStatusEnum = pgEnum("auction_status", [
  "draft",
  "scheduled",
  "active",
  "ended",
  "cancelled",
]);
export type AuctionStatus = (typeof auctionStatusEnum.enumValues)[number];

export const auctions = pgTable(
  "auctions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    // numeric, not float — avoids binary floating-point rounding errors on money.
    // Drizzle returns numeric columns as strings by default; cast at the app layer.
    startingPrice: numeric("starting_price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    currentPrice: numeric("current_price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    reservePrice: numeric("reserve_price", { precision: 12, scale: 2 }),
    buyNowPrice: numeric("buy_now_price", { precision: 12, scale: 2 }),
    bidIncrement: numeric("bid_increment", {
      precision: 12,
      scale: 2,
    }).notNull(),

    condition: text("condition").notNull(),

    status: auctionStatusEnum("status").notNull().default("draft"),

    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("auctions_category_id_idx").on(table.categoryId),
    index("auctions_seller_id_idx").on(table.sellerId),
    index("auctions_status_idx").on(table.status),
    index("auctions_end_time_idx").on(table.endTime),
  ],
);

export const auctionImages = pgTable(
  "auction_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auctionId: uuid("auction_id")
      .notNull()
      .references(() => auctions.id, { onDelete: "cascade" }),

    fileId: text("file_id").notNull(), // ImageKit file id — needed to delete/transform later
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),

    displayOrder: integer("display_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("auction_images_auction_id_idx").on(table.auctionId)],
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryHierarchy",
  }),
  children: many(categories, { relationName: "categoryHierarchy" }),
}));

export const auctionSettings = pgTable("auction_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  auctionId: uuid("auction_id")
    .notNull()
    .unique()
    .references(() => auctions.id, { onDelete: "cascade" }),

  autoExtendEnabled: boolean("auto_extend_enabled").notNull().default(false),
  autoExtendMinutes: integer("auto_extend_minutes"),
  maxBidsPerUser: integer("max_bids_per_user"),
  requireVerifiedBidder: boolean("require_verified_bidder")
    .notNull()
    .default(false),
  customRules: text("custom_rules"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  category: one(categories, {
    fields: [auctions.categoryId],
    references: [categories.id],
  }),
  seller: one(users, {
    fields: [auctions.sellerId],
    references: [users.id],
  }),
  images: many(auctionImages),
  settings: one(auctionSettings, {
    fields: [auctions.id],
    references: [auctionSettings.auctionId],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  verificationTokens: many(verificationTokens),
}));

export const auctionSettingsRelations = relations(
  auctionSettings,
  ({ one }) => ({
    auction: one(auctions, {
      fields: [auctionSettings.auctionId],
      references: [auctions.id],
    }),
  }),
);

export type AuctionSettings = typeof auctionSettings.$inferSelect;
export type NewAuctionSettings = typeof auctionSettings.$inferInsert;

export const auctionImagesRelations = relations(auctionImages, ({ one }) => ({
  auction: one(auctions, {
    fields: [auctionImages.auctionId],
    references: [auctions.id],
  }),
}));

export type Auction = typeof auctions.$inferSelect;
export type NewAuction = typeof auctions.$inferInsert;
export type AuctionImage = typeof auctionImages.$inferSelect;
export type NewAuctionImage = typeof auctionImages.$inferInsert;
export const verificationTokensRelations = relations(
  verificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  }),
);
/**
 *
 * Design users schema in Drizzle (id, name, email, password_hash, role, country, city, avatar_url, created_at) and migrate.
 */
