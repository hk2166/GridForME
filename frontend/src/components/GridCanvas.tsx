"use client";

import { useEffect, useState } from "react";
import { captureTile, getGrid, type GridTile } from "@/lib/api";
import { GridTile as GridTileView } from "./GridTile";

const demoUser = {
  id: "demo-user",
  name: "Demo Player",
  color: "#22C55E"
};

export function GridCanvas() {
  const [cols, setCols] = useState(40);
  const [tiles, setTiles] = useState<GridTile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGrid()
      .then((grid) => {
        setCols(grid.cols);
        setTiles(grid.tiles);
      })
      .catch(() => {
        setError("Could not load grid");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gridwars-border border-t-gridwars-accent" />
        Loading grid...
      </div>
    );
  }

  if (error) {
    return <p className="text-gridwars-danger">{error}</p>;
  }

  return (
    <div
      className="grid w-full max-w-5xl gap-px rounded border border-gridwars-border bg-gridwars-border p-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
      }}
    >
      {tiles.map((tile) => (
        <GridTileView key={tile.id} tile={tile} onClick={handleTileClick} />
      ))}
    </div>
  );
}