import { useEffect, useState } from "react";
import type { GridTile as GridTileType } from "@/lib/api";

type Props = {
  tile: GridTileType;
  onClick: (tile: GridTileType) => void;
  justCaptured?: boolean;
};

const RECENT_MS = 10_000; // glow for 10 seconds after capture

export function GridTile({ tile, onClick, justCaptured = false }: Props) {
  const isOwned = Boolean(tile.ownerId);

  // Track whether the tile was captured in the last 10s.
  // Re-evaluated whenever capturedAt changes (i.e. when a new owner claims it).
  const [isRecent, setIsRecent] = useState(() => {
    if (!tile.capturedAt) return false;
    return Date.now() - new Date(tile.capturedAt).getTime() < RECENT_MS;
  });

  useEffect(() => {
    if (!tile.capturedAt) {
      setIsRecent(false);
      return;
    }

    const elapsed = Date.now() - new Date(tile.capturedAt).getTime();
    const remaining = RECENT_MS - elapsed;

    if (remaining <= 0) {
      setIsRecent(false);
      return;
    }

    setIsRecent(true);
    const timer = window.setTimeout(() => setIsRecent(false), remaining);
    return () => window.clearTimeout(timer);
  }, [tile.capturedAt]);

  const baseGlow = isOwned
    ? `0 0 8px ${tile.color}AA, inset 0 0 4px rgba(255,255,255,0.25)`
    : undefined;

  const recentGlow = `0 0 18px ${tile.color}88, inset 0 0 6px rgba(255,255,255,0.15)`;

  const stealGlow = tile.wasSteal
    ? `0 0 10px rgba(255,255,255,0.12), 0 0 14px ${tile.color}99, inset 0 0 6px rgba(0,0,0,0.2)`
    : undefined;

  return (
    <button
      type="button"
      title={tile.ownerName ? `Owned by ${tile.ownerName}` : "Unclaimed"}
      onClick={() => onClick(tile)}
      className={[
        "group relative h-full w-full rounded-[3px] transition-all duration-150",
        "hover:z-10 hover:scale-[1.18] hover:ring-2 hover:ring-white/70",
        isOwned
          ? "bg-transparent"
          : "bg-gridwars-tile hover:bg-gridwars-tile/80"
      ].join(" ")}
      style={{
        backgroundColor: tile.color ?? undefined,
        boxShadow: isRecent ? recentGlow : stealGlow ?? baseGlow,
        outline: tile.wasSteal ? "1px solid rgba(255,255,255,0.1)" : undefined,
        animation: justCaptured
          ? "pop 0.4s cubic-bezier(0.22,1,0.36,1)"
          : undefined
      }}
    />
  );
}
