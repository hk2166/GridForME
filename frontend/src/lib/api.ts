const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type GridTile = {
  id: number;
  ownerId: string | null;
  ownerName: string | null;
  color: string | null;
  capturedAt: string | null;
};

export type GridResponse = {
  cols: number;
  rows: number;
  tiles: GridTile[];
};

export async function getGrid(): Promise<GridResponse> {
  const response = await fetch(`${API_URL}/api/grid`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch grid");
  }

  return response.json();
}

export async function captureTile(input: {
  tileId: number;
  userId: string;
  userName: string;
  color: string;
}): Promise<GridTile> {
  const response = await fetch(`${API_URL}/api/grid/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Failed to capture tile");
  }

  return response.json();
}


export type LeaderboardEntry = {
  userId: string;
  userName: string;
  color: string;
  tileCount: number;
  rank: number;
};

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_URL}/api/leaderboard`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  return response.json();
}
