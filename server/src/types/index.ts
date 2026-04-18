import type { Request } from "express";

export interface AuthPayload {
  userId: string;
  role: "user" | "admin";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface GameFilters {
  genre?: string;
  tag?: string;
  minPrice?: string;
  maxPrice?: string;
  isFree?: string;
  search?: string;
}
