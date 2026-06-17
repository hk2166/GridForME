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
    local key = KEYS[1]
    local field = ARGV[1]
    local updated = ARGV[2]

    local current = redis.call("HGET", key, field)

    if not current then
      return { err = "Tile not found" }
    end

    local ownerId = cjson.decode(current)["ownerId"]

    if ownerId ~= cjson.null then
      return { err = "Tile already captured" }
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