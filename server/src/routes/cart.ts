import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { cartItems, games, userLibrary, users } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/index.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, req.user!.userId),
      with: { game: true },
    });
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

router.post("/:gameId", async (req: AuthRequest, res, next) => {
  try {
    const { gameId } = req.params;

    const game = await db.query.games.findFirst({
      where: and(eq(games.id, gameId), eq(games.isActive, true)),
    });
    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const alreadyOwned = await db.query.userLibrary.findFirst({
      where: and(eq(userLibrary.userId, req.user!.userId), eq(userLibrary.gameId, gameId)),
    });
    if (alreadyOwned) {
      res.status(409).json({ error: "You already own this game" });
      return;
    }

    const existing = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.userId, req.user!.userId), eq(cartItems.gameId, gameId)),
    });
    if (existing) {
      res.status(409).json({ error: "Game already in cart" });
      return;
    }

    await db.insert(cartItems).values({ userId: req.user!.userId, gameId });
    res.status(201).json({ message: "Added to cart" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:gameId", async (req: AuthRequest, res, next) => {
  try {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, req.user!.userId), eq(cartItems.gameId, req.params.gameId)));
    res.json({ message: "Removed from cart" });
  } catch (err) {
    next(err);
  }
});

router.post("/checkout", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;

    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: { game: true },
    });

    if (items.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const total = items.reduce((sum, item) => sum + parseFloat(item.game.price), 0);

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const balance = parseFloat(user.balance as string);
    if (balance < total) {
      res.status(402).json({ error: "Insufficient balance" });
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ balance: (balance - total).toFixed(2) })
        .where(eq(users.id, userId));

      await tx.insert(userLibrary).values(
        items.map((item) => ({ userId, gameId: item.gameId }))
      );

      await tx.delete(cartItems).where(eq(cartItems.userId, userId));
    });

    res.json({ message: "Purchase successful", itemCount: items.length, total });
  } catch (err) {
    next(err);
  }
});

export default router;
