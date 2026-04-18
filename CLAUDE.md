# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SteamClone is a full-stack Steam-like game store. React + TypeScript + Tailwind frontend, Node.js + Express + TypeScript backend, PostgreSQL database via Drizzle ORM.

## Monorepo Structure

```
SteamClone/
├── client/                    # React + Vite + TypeScript + Tailwind CSS v4
│   └── src/
│       ├── api/               # Axios API clients (auth, games, cart)
│       ├── components/        # Layout + GameCard
│       ├── pages/             # Home, Store, GameDetail, Library, Cart, Login, Register
│       ├── stores/            # Zustand stores (authStore, cartStore)
│       └── router.tsx         # React Router v7 routes
├── server/                    # Express + TypeScript + Drizzle ORM
│   └── src/
│       ├── db/                # Drizzle schema, connection, seed
│       ├── middleware/        # JWT auth, error handler
│       ├── routes/            # auth, games, cart, users
│       └── index.ts           # Server entry point
└── docker-compose.yml         # PostgreSQL 16 + pgAdmin
```

## Environment

This project runs in **WSL2** (Ubuntu). The Windows `npm` is on PATH but does not work for this WSL path. Always use the Linux npm/npx:

- Check: `which npm` — if it points to `/mnt/c/...`, use `npm` via the Linux Node.js install (e.g. install via `nvm` or `apt`)
- Preferred: use `nvm` to manage Node.js within WSL

## Setup Commands

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Install dependencies
cd client && npm install
cd ../server && npm install

# 3. Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Run DB migrations and seed
cd server && npm run db:generate && npm run db:migrate && npm run db:seed

# 5. Start dev servers (in separate terminals)
cd server && npm run dev      # http://localhost:3000
cd client && npm run dev      # http://localhost:5173
```

## Key Technical Decisions

| Concern | Choice | Reason |
|---|---|---|
| Frontend bundler | Vite 8 | Fast HMR, modern ESM |
| CSS | Tailwind CSS v4 | Utility-first, zero config |
| Routing | React Router v7 | Loader/action patterns, data APIs |
| Server state | TanStack Query v5 | Caching, deduplication, optimistic updates |
| Client state | Zustand v5 | Minimal, performant, no boilerplate |
| HTTP client | Axios | Interceptors for JWT injection |
| ORM | Drizzle ORM | Type-safe, PostgreSQL-first, lightweight |
| Auth | JWT + bcryptjs | Stateless, standard, works without Redis |
| Validation | Zod | Schema-first, shared with TypeScript types |
| DB | PostgreSQL 16 | Relational, ACID, best for transactional data |

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | - | Create account |
| POST | /api/auth/login | - | Get JWT token |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/games | - | List games (paginated, filterable) |
| GET | /api/games/featured | - | Top-rated games |
| GET | /api/games/:slug | - | Game detail |
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

## DB Schema

Core tables: `users`, `games`, `game_screenshots`, `game_genres`, `game_tags`, `user_library`, `cart_items`, `wishlist_items`, `reviews`

All PKs are UUIDs. Migrations live in `server/src/db/migrations/`.

## pgAdmin

Access at http://localhost:5050  
Email: `admin@steamclone.dev` | Password: `admin`  
Connect to host `postgres`, port `5432`, user/pass `steamclone/steamclone_dev`
