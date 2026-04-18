import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

interface PgError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

const PG_ERRORS: Record<string, { status: number; error: string }> = {
  "23505": { status: 409, error: "Resource already exists" },
  "23503": { status: 409, error: "Referenced resource does not exist" },
  "23502": { status: 400, error: "Missing required field" },
  "23514": { status: 400, error: "Value violates check constraint" },
  "42P01": { status: 500, error: "Database table not found" },
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  const pgErr = err as PgError;
  if (pgErr?.code && PG_ERRORS[pgErr.code]) {
    const { status, error } = PG_ERRORS[pgErr.code];
    res.status(status).json({ error, detail: pgErr.detail });
    return;
  }

  if (err instanceof Error) {
    console.error(err.message, err.stack);
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  res.status(500).json({ error: "Unknown error" });
}
