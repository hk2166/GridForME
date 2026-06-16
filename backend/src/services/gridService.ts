import { env } from "../config/env";
import { redis } from "../db/redis";

const GRID_KEY = "grid:tiles";

export type GridTile = {
  id: number;
  ownerId: string | null;
  ownerName: string | null;
  color: string | null;
  capturedAt: string | null;
};

function createEmptyTile(id: number): GridTile {
  return {
    id,
    ownerId: null,
    ownerName: null,
    color: null,
    capturedAt: null
  };
}

export async function seedGridTiles() {
  const totalTiles = env.GRID_COLS * env.GRID_ROWS;

  // Skip seeding if the grid is already fully populated (fast restarts).
  const existing = await redis.hLen(GRID_KEY);
  if (existing >= totalTiles) {
    return;
  }

  // Build all tiles and write them in a single round-trip instead of
  // 1000 sequential calls to remote Redis.
  const entries: Record<string, string> = {};
  for (let id = 0; id < totalTiles; id++) {
    entries[String(id)] = JSON.stringify(createEmptyTile(id));
  }

  await redis.hSet(GRID_KEY, entries);
}

export async function getGridTiles(): Promise<GridTile[]> {
  const rawTiles = await redis.hGetAll(GRID_KEY);

  return Object.values(rawTiles)
    .map((tile) => JSON.parse(tile) as GridTile)
    .sort((a, b) => a.id - b.id);
}

export async function captureTile(input: {
  tileId: number;
  userId: string;
  userName: string;
  color: string;
}) {
  const rawTile = await redis.hGet(GRID_KEY, String(input.tileId));

  if (!rawTile) {
    throw new Error("Tile not found");
  }

  const tile = JSON.parse(rawTile) as GridTile;

  if (tile.ownerId) {
    throw new Error("Tile already captured");
  }

  const updatedTile: GridTile = {
    id: input.tileId,
    ownerId: input.userId,
    ownerName: input.userName,
    color: input.color,
    capturedAt: new Date().toISOString()
  };

  await redis.hSet(GRID_KEY, String(input.tileId), JSON.stringify(updatedTile));

  return updatedTile;
}