import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 32 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 64 }),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    country: varchar("country", { length: 2 }),
    balance: numeric("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
    role: userRoleEnum("role").notNull().default("user"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_username_idx").on(t.username),
  ]
);

// ─── Games ───────────────────────────────────────────────────────────────────

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0.00"),
    originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
    developer: varchar("developer", { length: 128 }),
    publisher: varchar("publisher", { length: 128 }),
    releaseDate: timestamp("release_date"),
    headerImage: text("header_image"),
    capsuleImage: text("capsule_image"),
    backgroundImage: text("background_image"),
    isFree: boolean("is_free").notNull().default(false),
    isEarlyAccess: boolean("is_early_access").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    reviewScore: integer("review_score").default(0),
    reviewCount: integer("review_count").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("games_slug_idx").on(t.slug),
    index("games_is_active_idx").on(t.isActive),
  ]
);

export const gameScreenshots = pgTable("game_screenshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  thumbnailUrl: text("thumbnail_url").notNull(),
  fullUrl: text("full_url").notNull(),
  order: integer("order").notNull().default(0),
});

export const gameGenres = pgTable(
  "game_genres",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    genre: varchar("genre", { length: 64 }).notNull(),
  },
  (t) => [index("game_genres_game_id_idx").on(t.gameId)]
);

export const gameTags = pgTable(
  "game_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(),
  },
  (t) => [index("game_tags_game_id_idx").on(t.gameId)]
);

// ─── User Library ─────────────────────────────────────────────────────────────

export const userLibrary = pgTable(
  "user_library",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
    playTimeMinutes: integer("play_time_minutes").notNull().default(0),
  },
  (t) => [
    uniqueIndex("user_library_user_game_idx").on(t.userId, t.gameId),
    index("user_library_user_id_idx").on(t.userId),
  ]
);

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("cart_items_user_game_idx").on(t.userId, t.gameId),
    index("cart_items_user_id_idx").on(t.userId),
  ]
);

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("wishlist_items_user_game_idx").on(t.userId, t.gameId),
    index("wishlist_items_user_id_idx").on(t.userId),
  ]
);

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    isRecommended: boolean("is_recommended").notNull(),
    content: text("content"),
    helpfulCount: integer("helpful_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("reviews_user_game_idx").on(t.userId, t.gameId),
    index("reviews_game_id_idx").on(t.gameId),
  ]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  library: many(userLibrary),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  reviews: many(reviews),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  screenshots: many(gameScreenshots),
  genres: many(gameGenres),
  tags: many(gameTags),
  libraryEntries: many(userLibrary),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  reviews: many(reviews),
}));

export const userLibraryRelations = relations(userLibrary, ({ one }) => ({
  user: one(users, { fields: [userLibrary.userId], references: [users.id] }),
  game: one(games, { fields: [userLibrary.gameId], references: [games.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  game: one(games, { fields: [cartItems.gameId], references: [games.id] }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, { fields: [wishlistItems.userId], references: [users.id] }),
  game: one(games, { fields: [wishlistItems.gameId], references: [games.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  game: one(games, { fields: [reviews.gameId], references: [games.id] }),
}));

// ─── Type exports ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GameScreenshot = typeof gameScreenshots.$inferSelect;
export type GameGenre = typeof gameGenres.$inferSelect;
export type GameTag = typeof gameTags.$inferSelect;
export type UserLibraryEntry = typeof userLibrary.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
