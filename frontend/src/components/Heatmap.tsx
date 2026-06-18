/**
 * Heatmap — renders a mini grid where each cell's opacity reflects how
 * many times the current user has captured that tile.
 *
 * HOW THE MATH WORKS:
 *   - counts = { tileId: numberOfCaptures }
 *   - maxCount = max value in counts (so the hottest tile = full colour)
 *   - For each tile: opacity = counts[tileId] / maxCount
 *   - Tiles never captured: fully transparent (dark bg shows through)
 */

type Props = {
  cols: number;
  rows: number;
  counts: Record<number, number>; // { tileId: captureCount }
  color: string;                  // user's color
};

export function Heatmap({ cols, rows, counts, color }: Props) {
  const totalTiles = cols * rows;
  const values = Object.values(counts);
  const maxCount = values.length > 0 ? Math.max(...values) : 1;

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gridwars-text">
        Your Activity Heatmap
      </h3>
      <p className="mb-3 text-xs text-gridwars-muted">
        Brighter = more times you&apos;ve captured that tile
      </p>

      <div
        className="inline-grid rounded-xl border border-gridwars-border/50 bg-gridwars-bg/60 p-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "1px"
        }}
      >
        {Array.from({ length: totalTiles }, (_, id) => {
          const count = counts[id] ?? 0;
          // Minimum opacity of 0.05 so uncaptured tiles are still visible.
          const opacity = count > 0 ? 0.15 + (count / maxCount) * 0.85 : 0.05;

          return (
            <div
              key={id}
              title={count > 0 ? `Tile ${id}: captured ${count}×` : `Tile ${id}: never`}
              className="h-3 w-3 rounded-[2px] transition-all"
              style={{ backgroundColor: color, opacity }}
            />
          );
        })}
      </div>

      {values.length === 0 && (
        <p className="mt-3 text-xs text-gridwars-muted/60">
          No captures yet — go claim some tiles!
        </p>
      )}
    </div>
  );
}
