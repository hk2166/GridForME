# GridWars

> Claim your territory. In real time.

GridWars is a real-time multiplayer grid game. Open the site, pick a username and color, and claim tiles on a shared 40×25 board. Every claim is broadcast instantly to all connected players over WebSockets, with a live leaderboard tracking who owns the most territory.

## How it works

- Pick a name and color, then join the grid
- Click any unclaimed tile to capture it — it turns your color instantly
- Everyone connected sees the tile flip in real time
- A short cooldown limits how fast you can capture
- After cooldown, you can steal tiles from other players
- The leaderboard updates live as territory changes hands

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Real-time | Socket.io |
| Backend | Node.js, Express, TypeScript |
| Hot state | Redis (grid state, cooldowns, online count) |
| Database | PostgreSQL via Prisma ORM |
| Hosting | Railway (backend), Vercel (frontend) |

## Architecture

Grid state lives in Redis for fast reads and writes. Durable data (users, capture history, leaderboard snapshots) lives in PostgreSQL. On each tile capture: write to Redis → broadcast over Socket.io → persist to PostgreSQL asynchronously. Conflicting clicks are resolved with an atomic Redis write — first writer wins.

## Project structure

```
gridwars/
├── backend/     # Node.js + Express + Socket.io + Prisma
└── frontend/    # Next.js 14 app
```

## Local setup

### Prerequisites
- Node.js 20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- A Redis instance (e.g. [Upstash](https://upstash.com))

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and REDIS_URL
npx prisma migrate dev
npm start
```

The backend runs on `http://localhost:4000`.

### Environment variables

See `backend/.env.example` for the full list. Key values:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string (use `rediss://` for Upstash/TLS)
- `PORT`, `CORS_ORIGIN`, `GRID_COLS`, `GRID_ROWS`

> Never commit your `.env` file. It is gitignored by default.

