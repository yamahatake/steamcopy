import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { users, userLibrary, wishlistItems, reviews } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/index.js";

const router = Router();

router.use(requireAuth);

router.get("/library", async (req: AuthRequest, res, next) => {
  try {
    const library = await db.query.userLibrary.findMany({
      where: eq(userLibrary.userId, req.user!.userId),
      with: { game: true },
      orderBy: (lib, { desc }) => [desc(lib.purchasedAt)],
    });
    res.json({ data: library });
  } catch (err) {
    next(err);
  }
});

router.get("/wishlist", async (req: AuthRequest, res, next) => {
  try {
    const list = await db.query.wishlistItems.findMany({
      where: eq(wishlistItems.userId, req.user!.userId),
      with: { game: true },
      orderBy: (w, { desc }) => [desc(w.addedAt)],
    });
    res.json({ data: list });
  } catch (err) {
    next(err);
  }
});

router.post("/wishlist/:gameId", async (req: AuthRequest, res, next) => {
  try {
    const { gameId } = req.params;
    const existing = await db.query.wishlistItems.findFirst({
      where: and(eq(wishlistItems.userId, req.user!.userId), eq(wishlistItems.gameId, gameId)),
    });
    if (existing) {
      res.status(409).json({ error: "Already wishlisted" });
      return;
    }
    await db.insert(wishlistItems).values({ userId: req.user!.userId, gameId });
    res.status(201).json({ message: "Added to wishlist" });
  } catch (err) {
    next(err);
  }
});

router.delete("/wishlist/:gameId", async (req: AuthRequest, res, next) => {
  try {
    await db
      .delete(wishlistItems)
      .where(
        and(eq(wishlistItems.userId, req.user!.userId), eq(wishlistItems.gameId, req.params.gameId))
      );
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    next(err);
  }
});

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(500).optional(),
  country: z.string().length(2).optional(),
  avatarUrl: z.string().url().optional(),
});

router.patch("/profile", async (req: AuthRequest, res, next) => {
  try {
    const updates = updateProfileSchema.parse(req.body);
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, req.user!.userId))
      .returning({ id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl, bio: users.bio, country: users.country });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

const reviewSchema = z.object({
  isRecommended: z.boolean(),
  content: z.string().max(2000).optional(),
});

router.post("/reviews/:gameId", async (req: AuthRequest, res, next) => {
  try {
    const { gameId } = req.params;
    const { isRecommended, content } = reviewSchema.parse(req.body);

    const owned = await db.query.userLibrary.findFirst({
      where: and(eq(userLibrary.userId, req.user!.userId), eq(userLibrary.gameId, gameId)),
    });
    if (!owned) {
      res.status(403).json({ error: "You must own the game to review it" });
      return;
    }

    const existing = await db.query.reviews.findFirst({
      where: and(eq(reviews.userId, req.user!.userId), eq(reviews.gameId, gameId)),
    });
    if (existing) {
      const [updated] = await db
        .update(reviews)
        .set({ isRecommended, content, updatedAt: new Date() })
        .where(and(eq(reviews.userId, req.user!.userId), eq(reviews.gameId, gameId)))
        .returning();
      res.json({ data: updated });
      return;
    }

    const [review] = await db
      .insert(reviews)
      .values({ userId: req.user!.userId, gameId, isRecommended, content })
      .returning();
    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
});

export default router;
