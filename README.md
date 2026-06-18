# GridWars

Real-time multiplayer territory capture. Open the site, pick a name and color, and claim tiles on a shared grid. Every move is broadcast instantly to all connected players.

**Live demo:** _coming soon_

---

## What it does

- Shared grid of configurable size (default 20×15)
- Click any tile to capture it in your color
- Steal tiles from other players after your cooldown expires
- Live leaderboard, online count, and capture feed update in real time
- Personal stats panel shows tiles owned, territory %, and rank
- Stats page shows global game metrics and your personal activity heatmap

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | SSR, file routing, fast iteration |
| Real-time | Socket.io | WebSockets with auto-reconnect and broadcast |
| Backend | Node.js + Express + TypeScript | Lightweight, fast to build |
| Hot state | Redis | Sub-millisecond tile reads/writes, cooldown TTLs, online set |
| Database | PostgreSQL via Prisma | Durable capture history and user records |

**Architecture decision:** Grid state lives in Redis (fast). Capture history and user data live in PostgreSQL (durable). On each tile capture: write Redis atomically via Lua → broadcast over Socket.io → persist to PostgreSQL asynchronously.

Conflict resolution uses a Redis Lua script (`HSET` with ownership check) — two simultaneous clicks on the same tile are serialised server-side. First writer wins.

---

## Project structure

```
gridwars/
├── backend/          # Express + Socket.io + Prisma
│   ├── src/
│   │   ├── config/   # Env config
│   │   ├── db/       # Redis + Prisma clients
│   │   ├── services/ # Grid, cooldown, leaderboard logic
│   │   └── socket/   # Socket.io event handlers
│   └── prisma/       # Schema + migrations
└── frontend/         # Next.js 14
    └── src/
        ├── app/      # Pages: / (landing), /grid, /stats
        ├── components/
        ├── hooks/
        └── lib/      # API helpers, socket singleton, config
```

---

## Local setup

### Prerequisites

- Node.js 20+
- A PostgreSQL database — [Neon](https://neon.tech) free tier works
- A Redis instance — [Upstash](https://upstash.com) free tier works (use `rediss://` URL for TLS)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and REDIS_URL
npx prisma migrate dev
npm run dev
```

Runs on `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

Runs on `http://localhost:3000`.

---

## Environment variables

### Backend — `backend/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port to listen on |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend origin |
| `GRID_COLS` | `40` | Grid width |
| `GRID_ROWS` | `25` | Grid height |
| `CAPTURE_COOLDOWN_SECONDS` | `5` | Seconds between captures per user |
| `GRID_RESET_SECRET` | — | Secret for `POST /api/grid/reset` |
| `DATABASE_URL` | **required** | PostgreSQL connection string |
| `REDIS_URL` | **required** | Redis connection string |

### Frontend — `frontend/.env.local`

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend URL |
| `NEXT_PUBLIC_CAPTURE_COOLDOWN_SECONDS` | `5` | Cooldown for optimistic UI |
| `NEXT_PUBLIC_GRID_COLS` | `40` | Grid width (for stats heatmap) |
| `NEXT_PUBLIC_GRID_ROWS` | `25` | Grid height (for stats heatmap) |

> Keep `DATABASE_URL` and `REDIS_URL` out of version control. Both `.env` files are gitignored.

---

## API reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health + Redis status |
| `GET` | `/api/grid` | Full grid state for initial hydration |
| `GET` | `/api/leaderboard` | Ranked players by tiles owned |
| `POST` | `/api/users` | Register a user `{ name, color }` |
| `POST` | `/api/grid/capture` | Capture a tile via REST |
| `GET` | `/api/stats` | Global stats (tiles, captures, online count) |
| `GET` | `/api/stats/user/:userId` | Per-user stats |
| `GET` | `/api/stats/user/:userId/heatmap` | Per-tile capture counts for heatmap |
| `POST` | `/api/grid/reset` | Wipe grid — requires `x-reset-secret` header |

## Socket.io events

**Client → Server**

| Event | Payload |
|---|---|
| `user:join` | `{ userId, name, color }` |
| `tile:capture` | `{ tileId, userId, userName, color }` |

**Server → Client**

| Event | Payload | Who receives |
|---|---|---|
| `grid:init` | `{ tiles }` | Joining client only |
| `tile:updated` | `GridTile` | All clients |
| `leaderboard:updated` | `{ rankings }` | All clients |
| `online:count` | `{ count }` | All clients |
| `capture:error` | `{ tileId, reason, retryAfter? }` | Capturing client only |
| `grid:reset` | `{ tiles }` | All clients |

---

## Admin: reset the grid

```bash
curl -X POST http://localhost:4000/api/grid/reset \
  -H "x-reset-secret: your_secret_here"
```

---

## Deployment

| Service | What |
|---|---|
| [Railway](https://railway.app) | Backend |
| [Vercel](https://vercel.com) | Frontend |
| [Neon](https://neon.tech) | PostgreSQL |
| [Upstash](https://upstash.com) | Redis |

Set all env vars in each platform's dashboard. For Upstash, ensure `REDIS_URL` starts with `rediss://` (TLS required).
