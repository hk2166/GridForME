import { env } from "../config/env";
import { redis } from "../db/redis";

const GRID_KEY = "grid:tiles";
const GRID_DIMS_KEY = "grid:dims";

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
  const currentDims = `${env.GRID_COLS}x${env.GRID_ROWS}`;
  const startedAt = Date.now();

  // Detect whether the configured grid size changed since the last seed.
  const [existing, storedDims] = await Promise.all([
    redis.hLen(GRID_KEY),
    redis.get(GRID_DIMS_KEY)
  ]);

  const sizeMatches = existing === totalTiles && storedDims === currentDims;

  if (sizeMatches) {
    console.log(
      `[grid] already seeded at ${currentDims} (${totalTiles} tiles) — ` +
        `checked in ${Date.now() - startedAt}ms`
    );
    return;
  }

  if (storedDims && storedDims !== currentDims) {
    console.log(
      `[grid] size changed ${storedDims} -> ${currentDims}, reseeding...`
    );
    await redis.del(GRID_KEY);
  } else {
    console.log(`[grid] seeding ${currentDims} (${totalTiles} tiles)...`);
  }

  // Build all tiles and write them in a single round-trip.
  const buildStart = Date.now();
  const entries: Record<string, string> = {};
  for (let id = 0; id < totalTiles; id++) {
    entries[String(id)] = JSON.stringify(createEmptyTile(id));
  }
  const buildMs = Date.now() - buildStart;

  const writeStart = Date.now();
  await redis.hSet(GRID_KEY, entries);
  await redis.set(GRID_DIMS_KEY, currentDims);
  const writeMs = Date.now() - writeStart;

  console.log(
    `[grid] seeded ${totalTiles} tiles — build ${buildMs}ms, ` +
      `redis write ${writeMs}ms, total ${Date.now() - startedAt}ms`
  );
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

// Realtime version — uses a Lua script for atomic compare-and-set so two
// simultaneous captures of the same tile are resolved server-side.
// First writer wins; second gets an error thrown back.
export async function captureTileRealtime(input: {
  tileId: number;
  userId: string;
  userName: string;
  color: string;
}): Promise<GridTile> {
  const updatedTile: GridTile = {
    id: input.tileId,
    ownerId: input.userId,
    ownerName: input.userName,
    color: input.color,
    capturedAt: new Date().toISOString()
  };

  const script = `
    local key    = KEYS[1]
    local field  = ARGV[1]
    local updated = ARGV[2]

    local current = redis.call("HGET", key, field)
    if not current then
      return redis.error_reply("Tile not found")
    end

    local data = cjson.decode(current)
    if data["ownerId"] ~= cjson.null and data["ownerId"] ~= nil and data["ownerId"] ~= false then
      return redis.error_reply("Tile already captured")
    end

    redis.call("HSET", key, field, updated)
    return updated
  `;

  const result = await redis.eval(script, {
    keys: [GRID_KEY],
    arguments: [String(input.tileId), JSON.stringify(updatedTile)]
  });

  if (typeof result !== "string") {
    throw new Error("Capture failed");
  }

  return JSON.parse(result) as GridTile;
}

// Wipes all tiles back to unclaimed in a single Redis round-trip.
// Used by the protected POST /api/grid/reset endpoint.
export async function resetGrid(): Promise<number> {
  const totalTiles = env.GRID_COLS * env.GRID_ROWS;
  const startedAt = Date.now();

  const entries: Record<string, string> = {};
  for (let id = 0; id < totalTiles; id++) {
    entries[String(id)] = JSON.stringify(createEmptyTile(id));
  }

  await redis.hSet(GRID_KEY, entries);

  console.log(
    `[grid] reset ${totalTiles} tiles to unclaimed in ${Date.now() - startedAt}ms`
  );

  return totalTiles;
}
