import type { GridTile as GridTileType } from "@/lib/api";

type Props = {
  tile: GridTileType;
  onClick: (tile: GridTileType) => void;
};

export function GridTile({ tile, onClick }: Props) {
  return (
    <button
      type="button"
      title={tile.ownerName ? `Owned by ${tile.ownerName}` : "Unclaimed"}
      onClick={() => onClick(tile)}
      className="h-full w-full border border-black/20 bg-gridwars-tile transition hover:brightness-125"
      style={{
        backgroundColor: tile.color ?? undefined
      }}
    />
  );
}