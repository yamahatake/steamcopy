import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/index.js";

const router = Router();

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(64).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signToken(userId: string, role: "user" | "admin") {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  } as jwt.SignOptions);
}

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, displayName } = registerSchema.parse(req.body);

    const existing = await db.query.users.findFirst({
      where: (u, { or }) => or(eq(u.email, email), eq(u.username, username)),
    });

    if (existing) {
      const field = existing.email === email ? "Email" : "Username";
      res.status(409).json({ error: `${field} already in use` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ username, email, passwordHash, displayName })
      .returning();

    const token = signToken(user.id, user.role);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        balance: user.balance,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken(user.id, user.role);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        balance: user.balance,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
      columns: {
        passwordHash: false,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
