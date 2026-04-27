# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SteamClone is a full-stack Steam-like game store. React + TypeScript + Tailwind frontend, Node.js + Express + TypeScript backend, PostgreSQL database via Drizzle ORM.

## Environment

This project runs in **WSL2** (Ubuntu). The Windows `npm` is on PATH but does not work for this WSL path. Always use the Linux npm via `nvm`.

**Note:** WSL2 has a local PostgreSQL on port 5432. Docker's PostgreSQL is mapped to **port 5433** to avoid conflicts. The `DATABASE_URL` uses `localhost:5433`.

## Commands

### Server (`cd server`)

```bash
npm run dev          # tsx watch — hot reload via tsx
npm run build        # tsc compile to dist/
npm run start        # run compiled dist/index.js

npm run db:generate  # generate Drizzle migration files from schema changes
npm run db:migrate   # apply pending migrations
npm run db:seed      # seed DB with sample games/users
npm run db:studio    # open Drizzle Studio (visual DB browser)
```

### Client (`cd client`)

```bash
npm run dev          # Vite dev server — http://localhost:5173
npm run build        # tsc -b && vite build
npm run lint         # ESLint
npm run preview      # serve production build locally
```

### Initial Setup

```bash
docker-compose up -d   # start PostgreSQL (port 5433) + pgAdmin (port 5050)
cd server && npm install && cp .env.example .env
cd ../client && npm install && cp .env.example .env
cd ../server && npm run db:generate && npm run db:migrate && npm run db:seed
```

## Architecture

### Request Flow

1. Client API calls go through `client/src/api/client.ts` — a single Axios instance that reads `VITE_API_URL` and auto-attaches the JWT from `localStorage` via a request interceptor. A 401 response interceptor clears the token and redirects to `/login`.
2. The server (`server/src/index.ts`) mounts routers under `/api/*`. All cart and user routes apply `requireAuth` middleware at the router level — not per-handler.
3. Route handlers call Drizzle directly (no service layer). Errors are passed to `next(err)` and handled centrally by `errorHandler.ts`, which maps Zod validation errors and PostgreSQL error codes to appropriate HTTP responses.

### Auth

- JWT payload carries `{ userId, role }` (see `server/src/types/index.ts`).
- The token is stored in both `localStorage` and Zustand's `authStore` (persisted via `zustand/middleware`). On rehydration, `isAuthenticated` is derived from presence of a token.
- `requireAdmin` chains `requireAuth` then checks `role === "admin"`.

### Client State

- **TanStack Query** handles all server state (fetching, caching, invalidation).
- **Zustand** manages two local stores: `authStore` (persisted user/token) and `cartStore` (in-memory cart items synced from API responses — not persisted).
- `cartStore` is kept in sync manually: after API mutations, callers call `setItems`/`addItem`/`removeItem` on the store.

### Database

Schema lives entirely in `server/src/db/schema.ts`. Drizzle relations are defined there and used for `.query.*` calls with `with:` (relational queries). Direct SQL-style calls use `eq`, `and`, etc. from `drizzle-orm`.

All PKs are UUIDs (`defaultRandom()`). Unique constraints prevent duplicate cart/wishlist/library entries at the DB level — the server also checks application-level to return meaningful errors before hitting the constraint.

## Key Conventions

- Server routes import types from `server/src/types/index.ts` (`AuthRequest`, `ApiResponse`, etc.).
- All client API modules in `client/src/api/` define their own TypeScript interfaces for response shapes — they are the source of truth for frontend types, not shared with the server.
- Game `price` and `balance` are stored as `numeric` in Postgres and returned as strings; always use `parseFloat()` before arithmetic.
- Games are identified by `slug` in URLs and client API calls; internally the DB uses `id` (UUID).

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Get JWT token |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/games | — | List games (paginated, filterable) |
| GET | /api/games/featured | — | Top-rated games |
| GET | /api/games/:slug | — | Game detail |
| GET | /api/games/:slug/ownership | JWT | Owned/wishlisted status |
| GET | /api/cart | JWT | Get cart |
| POST | /api/cart/:gameId | JWT | Add to cart |
| DELETE | /api/cart/:gameId | JWT | Remove from cart |
| POST | /api/cart/checkout | JWT | Purchase cart (deducts balance) |
| GET | /api/users/library | JWT | User's owned games |
| GET | /api/users/wishlist | JWT | User's wishlist |
| POST | /api/users/wishlist/:gameId | JWT | Add to wishlist |
| DELETE | /api/users/wishlist/:gameId | JWT | Remove from wishlist |
| PATCH | /api/users/profile | JWT | Update profile |
| POST | /api/users/reviews/:gameId | JWT | Review a game (must own) |

## pgAdmin

http://localhost:5050 — Email: `admin@steamclone.dev` / Password: `admin`  
Connect to host `postgres`, port `5432`, user/pass `steamclone/steamclone_dev`
