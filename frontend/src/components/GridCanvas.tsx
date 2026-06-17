"use client";

import { useEffect, useRef, useState } from "react";
import { getGrid, type GridTile } from "@/lib/api";
import { GridTile as GridTileView } from "./GridTile";
import { useSocket } from "@/hooks/useSocket";
import { useCooldown } from "@/hooks/useCooldown";

const CAPTURE_COOLDOWN_SECONDS = 5;

const demoUser = {
  id: "demo-user",
  name: "Demo Player",
  color: "#22C55E"
};

const TILE_GAP = 1;

export function GridCanvas() {
  const cooldown = useCooldown();
  const [cols, setCols] = useState(40);
  const [rows, setRows] = useState(25);
  const [tiles, setTiles] = useState<GridTile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tileSize, setTileSize] = useState(20);
  const [justCapturedId, setJustCapturedId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pendingTilesRef = useRef<Record<number, GridTile>>({});
  const { socket, isConnected } = useSocket();

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
    if (!isConnected) return;

    socket.emit("user:join", {
      userId: demoUser.id,
      name: demoUser.name,
      color: demoUser.color
    });
  }, [socket, isConnected]);

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

    function handleCaptureError(payload: { tileId: number; message?: string }) {
      const previousTile = pendingTilesRef.current[payload.tileId];

      if (previousTile) {
        setTiles((currentTiles) =>
          currentTiles.map((tile) =>
            tile.id === payload.tileId ? previousTile : tile
          )
        );

        delete pendingTilesRef.current[payload.tileId];
      }

      setError(payload.message ?? "Tile capture failed");
    }

    socket.on("grid:init", handleGridInit);
    socket.on("tile:updated", handleTileUpdated);
    socket.on("capture:error", handleCaptureError);

    return () => {
      socket.off("grid:init", handleGridInit);
      socket.off("tile:updated", handleTileUpdated);
      socket.off("capture:error", handleCaptureError);
    };
  }, [socket]);

  // Recompute tile size so the whole grid fits the available area, on every
  // layout/viewport change. Triggered by grid dimensions and the container
  // resizing (window resize, panel changes, etc.).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeTileSize = () => {
      const { width, height } = container.getBoundingClientRect();
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
    observer.observe(container);

    return () => observer.disconnect();
  }, [cols, rows, isLoading]);

  function handleTileClick(tile: GridTile) {
    if (tile.ownerId) return;
    if (cooldown.isCoolingDown) {
      setError(`Wait ${cooldown.remaining}s before capturing again`);
    return;
}

    setError(null);

    const optimisticTile: GridTile = {
      ...tile,
      ownerId: demoUser.id,
      ownerName: demoUser.name,
      color: demoUser.color,
      capturedAt: new Date().toISOString()
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
      userId: demoUser.id,
      userName: demoUser.name,
      color: demoUser.color
    });
    cooldown.start(CAPTURE_COOLDOWN_SECONDS);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-gridwars-muted">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-gridwars-border border-t-gridwars-accent" />
        <span className="text-sm font-medium tracking-wide">Loading grid...</span>
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
    <div
      ref={containerRef}
      className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 overflow-hidden"
    >
      {error ? (
        <div className="fixed bottom-2 left-2 z-90 rounded-lg border border-gridwars-danger/40 bg-gridwars-danger/10 px-4 py-2 text-sm text-gridwars-danger backdrop-blur-xl bg-opacity-50 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-50">
          {error}
        </div>
      ) : null}

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
  );
}
