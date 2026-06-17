"use client";

import { useEffect, useRef, useState } from "react";
import {
  getGrid,
  getLeaderboard,
  type GridTile,
  type LeaderboardEntry
} from "@/lib/api";
import { useCooldown } from "@/hooks/useCooldown";
import { useSocket } from "@/hooks/useSocket";
import { type UserProfile } from "@/hooks/useUser";
import { config } from "@/lib/config";
import { CooldownBar } from "./CooldownBar";
import { GridTile as GridTileView } from "./GridTile";
import { Leaderboard } from "./Leaderboard";
import { OnlineCount } from "./OnlineCount";
import { StatsPanel } from "./StatsPanel";


type Props = {
  user: UserProfile;
};



const TILE_GAP = 1;

export function GridCanvas({ user }: Props) {
  const cooldown = useCooldown();
  const { socket, isConnected } = useSocket();

  const [cols, setCols] = useState(40);
  const [rows, setRows] = useState(25);
  const [tiles, setTiles] = useState<GridTile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tileSize, setTileSize] = useState(20);
  const [justCapturedId, setJustCapturedId] = useState<number | null>(null);
  const myEntry = leaderboard.find(e => e.userId === user.id);
  const tilesOwned = myEntry?.tileCount ?? 0;
  const myRank = myEntry?.rank ?? null;

  const gridAreaRef = useRef<HTMLDivElement>(null);
  const pendingTilesRef = useRef<Record<number, GridTile>>({});

  useEffect(() => {
    getGrid()
      .then((grid) => {
        setCols(grid.cols);
        setRows(grid.rows);
        setTiles(grid.tiles);
      })
      .catch(() => {
        setError("Could not load grid");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    getLeaderboard()
      .then(setLeaderboard)
      .catch(() => {
        setError("Could not load leaderboard");
      });
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    socket.emit("user:join", {
      userId: user.id,
      name: user.name,
      color: user.color
    });
  }, [socket, isConnected, user]);

  useEffect(() => {
    function handleGridInit(payload: { tiles: GridTile[] }) {
      setTiles(payload.tiles);
      setError(null);
      setIsLoading(false);
    }

    function handleTileUpdated(updatedTile: GridTile) {
      delete pendingTilesRef.current[updatedTile.id];

      setTiles((currentTiles) =>
        currentTiles.map((tile) =>
          tile.id === updatedTile.id ? updatedTile : tile
        )
      );

      setError(null);
      setJustCapturedId(updatedTile.id);
      window.setTimeout(() => setJustCapturedId(null), 400);
    }

    function handleCaptureError(payload: {
      tileId: number;
      message?: string;
      retryAfter?: number;
    }) {
      const previousTile = pendingTilesRef.current[payload.tileId];

      if (previousTile) {
        setTiles((currentTiles) =>
          currentTiles.map((tile) =>
            tile.id === payload.tileId ? previousTile : tile
          )
        );

        delete pendingTilesRef.current[payload.tileId];
      }

      if (payload.retryAfter) {
        cooldown.start(payload.retryAfter);
      }

      setError(payload.message ?? "Tile capture failed");
    }

    function handleLeaderboardUpdated(payload: {
      rankings: LeaderboardEntry[];
    }) {
      setLeaderboard(payload.rankings);
    }

    function handleOnlineCount(payload: { count: number }) {
      setOnlineCount(payload.count);
    }

    socket.on("grid:init", handleGridInit);
    socket.on("tile:updated", handleTileUpdated);
    socket.on("capture:error", handleCaptureError);
    socket.on("leaderboard:updated", handleLeaderboardUpdated);
    socket.on("online:count", handleOnlineCount);

    return () => {
      socket.off("grid:init", handleGridInit);
      socket.off("tile:updated", handleTileUpdated);
      socket.off("capture:error", handleCaptureError);
      socket.off("leaderboard:updated", handleLeaderboardUpdated);
      socket.off("online:count", handleOnlineCount);
    };
  }, [socket, cooldown.start]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const gridArea = gridAreaRef.current;
    if (!gridArea) return;

    const computeTileSize = () => {
      const { width, height } = gridArea.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const availableWidth = width - TILE_GAP * (cols - 1);
      const availableHeight = height - TILE_GAP * (rows - 1);
      const size = Math.floor(
        Math.min(availableWidth / cols, availableHeight / rows)
      );

      setTileSize(Math.max(size, 1));
    };

    computeTileSize();

    const observer = new ResizeObserver(computeTileSize);
    observer.observe(gridArea);

    return () => observer.disconnect();
  }, [cols, rows, isLoading]);

function handleTileClick(tile: GridTile) {
  // allow stealing (tile.ownerId may exist)
  if (cooldown.isCoolingDown) {
    setError(`Wait ${cooldown.remaining}s before capturing again`);
    return;
  }

  setError(null);

  const optimisticTile: GridTile = {
    ...tile,
    ownerId: user.id,
    ownerName: user.name,
    color: user.color,
    capturedAt: new Date().toISOString(),
    wasSteal: Boolean(tile.ownerId && tile.ownerId !== user.id)
  };

  pendingTilesRef.current[tile.id] = tile;

  setTiles((currentTiles) =>
    currentTiles.map((currentTile) =>
      currentTile.id === tile.id ? optimisticTile : currentTile
    )
  );

  setJustCapturedId(tile.id);
  window.setTimeout(() => setJustCapturedId(null), 400);

  socket.emit("tile:capture", {
    tileId: tile.id,
    userId: user.id,
    userName: user.name,
    color: user.color
  });

  cooldown.start(config.captureCooldownSeconds);
}

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-gridwars-muted">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-gridwars-border border-t-gridwars-accent" />
        <span className="text-sm font-medium tracking-wide">
          Loading grid...
        </span>
      </div>
    );
  }

  if (error && tiles.length === 0) {
    return (
      <div className="rounded-xl border border-gridwars-danger/40 bg-gridwars-danger/10 px-5 py-4 text-gridwars-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 overflow-hidden">
      <div className="flex w-full items-center justify-end">
        <OnlineCount count={onlineCount} />
      </div>

      {error ? (
        <div className="fixed bottom-2 left-2 z-50 rounded-lg border border-gridwars-danger/40 bg-gridwars-danger/10 px-4 py-2 text-sm text-gridwars-danger shadow-lg backdrop-blur-xl">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 w-full flex-1 items-stretch justify-center gap-4">
        <StatsPanel
          tilesOwned={tilesOwned}
          rank={myRank}
          totalTiles={cols * rows}
        />
        <div
          ref={gridAreaRef}
          className="flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-gridwars-accent/40 via-gridwars-accent2/30 to-gridwars-accent3/40 p-[1.5px] shadow-2xl shadow-gridwars-accent/10">
            <div
              className="grid rounded-2xl bg-gridwars-panel/80 p-2 backdrop-blur-sm"
              style={{
                gap: `${TILE_GAP}px`,
                gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${tileSize}px)`
              }}
            >
              {tiles.map((tile) => (
                <GridTileView
                  key={tile.id}
                  tile={tile}
                  onClick={handleTileClick}
                  justCaptured={tile.id === justCapturedId}
                />
              ))}
            </div>
          </div>
        </div>

        <Leaderboard entries={leaderboard} />
      </div>

      <CooldownBar
        remaining={cooldown.remaining}
        maxSeconds={config.captureCooldownSeconds}
      />
    </div>
  );
}

