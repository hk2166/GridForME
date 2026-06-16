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
    } catch {
      setError("Tile capture failed");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-12 text-gridwars-muted">
        <span className="h-6 w-6 animate-spin rounded-full border-4 border-gridwars-border border-t-gridwars-accent" />
        <span className="text-lg">Loading grid...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-gridwars-danger">{error}</p>;
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-1 items-center justify-center overflow-hidden"
    >
      <div
        className="grid rounded border border-gridwars-border bg-gridwars-border p-1"
        style={{
          gap: `${TILE_GAP}px`,
          gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${tileSize}px)`
        }}
      >
        {tiles.map((tile) => (
          <GridTileView key={tile.id} tile={tile} onClick={handleTileClick} />
        ))}
      </div>
    </div>
  );
}
