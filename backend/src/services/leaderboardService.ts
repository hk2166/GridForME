import { getGridTiles } from "./gridService";

export type LeaderboardEntry = {
  userId: string;
  userName: string;
  color: string;
  tileCount: number;
  rank: number;
};

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const tiles = await getGridTiles();

  const counts = new Map<string, Omit<LeaderboardEntry, "rank">>();

  for (const tile of tiles) {
    if (!tile.ownerId || !tile.ownerName || !tile.color) continue;

    const existing = counts.get(tile.ownerId);

    if (existing) {
      existing.tileCount += 1;
    } else {
      counts.set(tile.ownerId, {
        userId: tile.ownerId,
        userName: tile.ownerName,
        color: tile.color,
        tileCount: 1
      });
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.tileCount - a.tileCount)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
}