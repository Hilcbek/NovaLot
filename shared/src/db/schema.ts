import { relations } from "drizzle-orm";
import {
  boolean,
  index,
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

export const usersRelations = relations(users, ({ many }) => ({
  verificationTokens: many(verificationTokens),
}));

// many tokens → one user
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
