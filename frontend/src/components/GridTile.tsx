import type { GridTile as GridTileType } from "@/lib/api";

type Props = {
  tile: GridTileType;
  onClick: (tile: GridTileType) => void;
  justCaptured?: boolean;
};

export function GridTile({ tile, onClick, justCaptured = false }: Props) {
  const isOwned = Boolean(tile.ownerId);

  return (
    <button
      type="button"
      title={tile.ownerName ? `Owned by ${tile.ownerName}` : "Unclaimed"}
      onClick={() => onClick(tile)}
      className={[
        "group relative h-full w-full rounded-[3px] transition-all duration-150",
        "hover:z-10 hover:scale-[1.18] hover:ring-2 hover:ring-white/70",
        isOwned
          ? "animate-pop"
          : "bg-gridwars-tile hover:bg-gridwars-tile/80"
      ].join(" ")}
      style={{
        backgroundColor: tile.color ?? undefined,
        boxShadow: isOwned
          ? `0 0 8px ${tile.color}AA, inset 0 0 4px rgba(255,255,255,0.25)`
          : undefined,
        animation: justCaptured ? "pop 0.4s cubic-bezier(0.22,1,0.36,1)" : undefined
      }}
    />
  );
}
