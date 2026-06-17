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
import { useToast } from "@/hooks/useToast";
import { type UserProfile } from "@/hooks/useUser";
import { config } from "@/lib/config";
import { CooldownBar } from "./CooldownBar";
import { GridTile as GridTileView } from "./GridTile";
import { Leaderboard } from "./Leaderboard";
import { OnlineCount } from "./OnlineCount";
import { RulesModal } from "./RulesModal";
import { StatsPanel } from "./StatsPanel";
import { ToastContainer } from "./Toast";

type Props = {
  user: UserProfile;
};

const TILE_GAP = 1;

export function GridCanvas({ user }: Props) {
  const cooldown = useCooldown();
  const { socket, isConnected } = useSocket();
  const { toasts, addToast, dismiss } = useToast();

  const [cols, setCols] = useState(40);
  const [rows, setRows] = useState(25);
  const [tiles, setTiles] = useState<GridTile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tileSize, setTileSize] = useState(20);
  const [justCapturedId, setJustCapturedId] = useState<number | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const myEntry = leaderboard.find((e) => e.userId === user.id);
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
      .catch(() => addToast("Could not load grid", "error"))
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getLeaderboard()
      .then(setLeaderboard)
      .catch(() => addToast("Could not load leaderboard", "error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      setIsLoading(false);
    }

    function handleTileUpdated(updatedTile: GridTile) {
      delete pendingTilesRef.current[updatedTile.id];
      setTiles((cur) =>
        cur.map((t) => (t.id === updatedTile.id ? updatedTile : t))
      );
      setJustCapturedId(updatedTile.id);
      window.setTimeout(() => setJustCapturedId(null), 400);

      // Toast for someone else's capture
      if (updatedTile.ownerId !== user.id) {
        const msg = updatedTile.wasSteal
          ? `${updatedTile.ownerName} stole a tile!`
          : `${updatedTile.ownerName} claimed a tile`;
        addToast(msg, "info");
      }
    }

    function handleCaptureError(payload: {
      tileId: number;
      reason?: string;
      message?: string;
      retryAfter?: number;
    }) {
      const prev = pendingTilesRef.current[payload.tileId];
      if (prev) {
        setTiles((cur) =>
          cur.map((t) => (t.id === payload.tileId ? prev : t))
        );
        delete pendingTilesRef.current[payload.tileId];
      }
      if (payload.retryAfter) cooldown.start(payload.retryAfter);

      if (payload.reason === "cooldown") {
        addToast(`Cooldown! Wait ${payload.retryAfter}s`, "error");
      } else {
        addToast(payload.message ?? "Tile capture failed", "error");
      }
    }

    function handleLeaderboardUpdated(payload: { rankings: LeaderboardEntry[] }) {
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
  }, [socket, cooldown.start, user.id, addToast]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (cooldown.isCoolingDown) {
      addToast(`Wait ${cooldown.remaining}s before capturing again`, "error");
      return;
    }

    const isSteal = Boolean(tile.ownerId && tile.ownerId !== user.id);

    const optimisticTile: GridTile = {
      ...tile,
      ownerId: user.id,
      ownerName: user.name,
      color: user.color,
      capturedAt: new Date().toISOString(),
      wasSteal: isSteal
    };

    pendingTilesRef.current[tile.id] = tile;
    setTiles((cur) =>
      cur.map((t) => (t.id === tile.id ? optimisticTile : t))
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
    addToast(isSteal ? "Tile stolen! 🔥" : "Tile captured!", "success");
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-gridwars-muted">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-gridwars-border border-t-gridwars-accent" />
        <span className="text-sm font-medium tracking-wide">Loading grid...</span>
      </div>
    );
  }

  return (
    <>
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex h-full w-full flex-1 flex-col gap-3 overflow-hidden">
        {/* Top bar */}
        <div className="flex w-full shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-gridwars-border/70 bg-gridwars-panel/60 px-3 py-1.5 text-xs text-gridwars-muted backdrop-blur transition-colors hover:text-gridwars-text"
            aria-label="Show rules"
          >
            <span className="font-bold">?</span> How to play
          </button>
          <OnlineCount count={onlineCount} />
        </div>

        {/* Main area: stats | grid | leaderboard */}
        <div className="flex min-h-0 w-full flex-1 items-stretch gap-2 sm:gap-4">
          {/* Stats panel — hidden on very small screens */}
          <div className="hidden sm:flex sm:shrink-0">
            <StatsPanel
              tilesOwned={tilesOwned}
              rank={myRank}
              totalTiles={cols * rows}
            />
          </div>

          {/* Grid */}
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

          {/* Leaderboard — hidden on small screens */}
          <div className="hidden md:flex md:shrink-0">
            <Leaderboard entries={leaderboard} />
          </div>
        </div>

        <CooldownBar
          remaining={cooldown.remaining}
          maxSeconds={config.captureCooldownSeconds}
        />
      </div>
    </>
  );
}
