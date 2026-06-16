"use client";

import { useEffect, useRef, useState } from "react";
import { captureTile, getGrid, type GridTile } from "@/lib/api";
import { GridTile as GridTileView } from "./GridTile";

const demoUser = {
  id: "demo-user",
  name: "Demo Player",
  color: "#22C55E"
};

// Gap between tiles in pixels (matches the `gap` style below).
const TILE_GAP = 1;

export function GridCanvas() {
  const [cols, setCols] = useState(40);
  const [rows, setRows] = useState(25);
  const [tiles, setTiles] = useState<GridTile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tileSize, setTileSize] = useState(20);
  const [justCapturedId, setJustCapturedId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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

  async function handleTileClick(tile: GridTile) {
    if (tile.ownerId) return;

    try {
      const updatedTile = await captureTile({
        tileId: tile.id,
        userId: demoUser.id,
        userName: demoUser.name,
        color: demoUser.color
      });

      setTiles((currentTiles) =>
        currentTiles.map((currentTile) =>
          currentTile.id === updatedTile.id ? updatedTile : currentTile
        )
      );

      setJustCapturedId(updatedTile.id);
      window.setTimeout(() => setJustCapturedId(null), 400);
    } catch {
      setError("Tile capture failed");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-gridwars-muted">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-gridwars-border border-t-gridwars-accent" />
        <span className="text-sm font-medium tracking-wide">Loading grid...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gridwars-danger/40 bg-gridwars-danger/10 px-5 py-4 text-gridwars-danger">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-1 items-center justify-center overflow-hidden"
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
  );
}
