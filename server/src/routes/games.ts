import { Router } from "express";
import { eq, and, gte, lte, ilike, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { games, gameGenres, gameTags, gameScreenshots, userLibrary, wishlistItems } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/index.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      genre,
      tag,
      minPrice,
      maxPrice,
      isFree,
      search,
      sort = "reviewScore",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(games.isActive, true)];

    if (search) conditions.push(ilike(games.title, `%${search}%`));
    if (isFree === "true") conditions.push(eq(games.isFree, true));
    if (minPrice) conditions.push(gte(games.price, minPrice));
    if (maxPrice) conditions.push(lte(games.price, maxPrice));

    const baseQuery = db
      .select()
      .from(games)
      .where(and(...conditions))
      .limit(limitNum)
      .offset(offset);

    const rows = await baseQuery;

    const gamesWithDetails = await Promise.all(
      rows.map(async (game) => {
        const [genres, tags, screenshots] = await Promise.all([
          db.select().from(gameGenres).where(eq(gameGenres.gameId, game.id)),
          db.select().from(gameTags).where(eq(gameTags.gameId, game.id)),
          db
            .select()
            .from(gameScreenshots)
            .where(eq(gameScreenshots.gameId, game.id))
            .orderBy(gameScreenshots.order)
            .limit(1),
        ]);
        return { ...game, genres, tags, screenshots };
      })
    );

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(games)
      .where(and(...conditions));

    res.json({
      data: gamesWithDetails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/featured", async (_req, res, next) => {
  try {
    const featured = await db
      .select()
      .from(games)
      .where(eq(games.isActive, true))
      .orderBy(sql`${games.reviewScore} desc`)
      .limit(6);

    const withDetails = await Promise.all(
      featured.map(async (game) => {
        const [genres, screenshots] = await Promise.all([
          db.select().from(gameGenres).where(eq(gameGenres.gameId, game.id)),
          db
            .select()
            .from(gameScreenshots)
            .where(eq(gameScreenshots.gameId, game.id))
            .orderBy(gameScreenshots.order)
            .limit(4),
        ]);
        return { ...game, genres, screenshots };
      })
    );

    res.json({ data: withDetails });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const game = await db.query.games.findFirst({
      where: eq(games.slug, req.params.slug),
    });

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const [genres, tags, screenshots] = await Promise.all([
      db.select().from(gameGenres).where(eq(gameGenres.gameId, game.id)),
      db.select().from(gameTags).where(eq(gameTags.gameId, game.id)),
      db
        .select()
        .from(gameScreenshots)
        .where(eq(gameScreenshots.gameId, game.id))
        .orderBy(gameScreenshots.order),
    ]);

    res.json({ data: { ...game, genres, tags, screenshots } });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug/ownership", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const game = await db.query.games.findFirst({
      where: eq(games.slug, req.params.slug),
      columns: { id: true },
    });

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const [owned, wishlisted] = await Promise.all([
      db.query.userLibrary.findFirst({
        where: and(
          eq(userLibrary.userId, req.user!.userId),
          eq(userLibrary.gameId, game.id)
        ),
      }),
      db.query.wishlistItems.findFirst({
        where: and(
          eq(wishlistItems.userId, req.user!.userId),
          eq(wishlistItems.gameId, game.id)
        ),
      }),
    ]);

    res.json({ owned: !!owned, wishlisted: !!wishlisted });
  } catch (err) {
    next(err);
  }
});

export default router;
