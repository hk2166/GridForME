import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { redis } from "./db/redis";
import { prisma } from "./db/prisma";
import { captureTile, getGridTiles, seedGridTiles } from "./services/gridService";

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
  const tiles = await getGridTiles();

  res.json({
    cols: env.GRID_COLS,
    rows: env.GRID_ROWS,
    tiles
  });
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

async function start() {
  await redis.connect();

  app.listen(env.PORT, () => {
    console.log(`http://localhost:${env.PORT}`);
  });

  // Seed after the server is already accepting requests so startup isn't blocked.
  await seedGridTiles();
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
  
});