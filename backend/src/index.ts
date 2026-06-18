import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { redis } from "./db/redis";
import { prisma } from "./db/prisma";
import { captureTile, getGridTiles, seedGridTiles, resetGrid } from "./services/gridService";
import http from "http";
import { initializeSocket } from "./socket";
import { getLeaderboard } from "./services/leaderboardService";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  const redisStatus = redis.isOpen ? "connected" : "disconnected";

  res.json({
    status: "ok",
    service: "gridwars-backend",
    redis: redisStatus
  });
});

app.get("/api/grid", async (_req, res) => {
  const startedAt = Date.now();
  const tiles = await getGridTiles();
  console.log(`[grid] GET /api/grid served ${tiles.length} tiles in ${Date.now() - startedAt}ms`);

  res.json({
    cols: env.GRID_COLS,
    rows: env.GRID_ROWS,
    tiles
  });
});

app.get("/api/leaderboard", async (_req, res) => {
  const leaderboard = await getLeaderboard();

  res.json(leaderboard);
});

app.post("/api/users", async (req, res) => {
  const { name, color } = req.body;

  if (!name || !color) {
    return res.status(400).json({ error: "name and color are required" });
  }

  const user = await prisma.user.create({
    data: { name, color }
  });

  res.status(201).json(user);
});


app.get("/api/stats", async (_req, res) => {
  const [tiles, onlineCount, totalCaptures] = await Promise.all([
    getGridTiles(),
    redis.sCard("online:users"),
    prisma.capture.count()
  ]);

  const claimedTiles = tiles.filter((t) => t.ownerId !== null).length;

  res.json({
    totalTiles: env.GRID_COLS * env.GRID_ROWS,
    claimedTiles,
    onlineCount,
    totalCaptures
  });
});

app.get("/api/stats/user/:userId", async (req, res) => {
  const { userId } = req.params;

  const [tiles, totalCaptures, steals] = await Promise.all([
    getGridTiles(),
    prisma.capture.count({ where: { userId } }),
    prisma.capture.count({ where: { userId, wasSteal: true } })
  ]);

  const tilesOwned = tiles.filter((t) => t.ownerId === userId).length;

  res.json({ userId, tilesOwned, totalCaptures, steals });
});

// Returns per-tile capture counts for the heatmap — { tileId: count }
app.get("/api/stats/user/:userId/heatmap", async (req, res) => {
  const { userId } = req.params;

  const captures = await prisma.capture.findMany({
    where: { userId },
    select: { tileId: true }
  });

  const counts: Record<number, number> = {};
  for (const { tileId } of captures) {
    counts[tileId] = (counts[tileId] ?? 0) + 1;
  }

  res.json(counts);
});

app.post("/api/grid/capture", async (req, res) => {
  const { tileId, userId, userName, color } = req.body;

  if (
    typeof tileId !== "number" ||
    !userId ||
    !userName ||
    !color
  ) {
    return res.status(400).json({
      error: "tileId, userId, userName and color are required"
    });
  }

  try {
    const tile = await captureTile({
      tileId,
      userId,
      userName,
      color
    });

    res.status(200).json(tile);
  } catch (error) {
    res.status(409).json({
      error: error instanceof Error ? error.message : "Capture failed"
    });
  }
});

app.post("/api/grid/reset", async (req, res) => {
  const secret = req.headers["x-reset-secret"];

  if (!env.GRID_RESET_SECRET || secret !== env.GRID_RESET_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const totalTiles = await resetGrid();

  // Broadcast fresh empty grid to all connected clients instantly.
  const tiles = await getGridTiles();
  gridResetEmitter?.(tiles);

  res.json({ ok: true, tilesReset: totalTiles });
});

// Holds a reference to the Socket.io broadcast function, set after server starts.
let gridResetEmitter: ((tiles: unknown) => void) | null = null;

async function start() {
  await redis.connect();
  await seedGridTiles();

  const server = http.createServer(app);

  const io = initializeSocket(server);

  // Give the reset endpoint access to Socket.io broadcasts.
  gridResetEmitter = (tiles) => io.emit("grid:reset", { tiles });

  server.listen(env.PORT, () => {
    console.log(`GridWars backend running on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
  
});
