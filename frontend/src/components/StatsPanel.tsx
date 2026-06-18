type Props = {
  tilesOwned: number;
  rank: number | null;
  totalTiles: number;
  /** compact = horizontal row of pills, used on mobile below the grid */
  compact?: boolean;
};

export function StatsPanel({ tilesOwned, rank, totalTiles, compact = false }: Props) {
  const percentage =
    totalTiles > 0 ? ((tilesOwned / totalTiles) * 100).toFixed(1) : "0.0";

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 px-4 py-2.5 backdrop-blur-xl">
        <CompactStat label="Tiles" value={String(tilesOwned)} />
        <div className="h-4 w-px bg-gridwars-border/60" />
        <CompactStat label="Territory" value={`${percentage}%`} />
        <div className="h-4 w-px bg-gridwars-border/60" />
        <CompactStat label="Rank" value={rank ? `#${rank}` : "—"} />
      </div>
    );
  }

  return (
    <aside className="flex w-48 shrink-0 flex-col gap-3 rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 p-4 backdrop-blur-xl">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-gridwars-muted">
        Your Stats
      </h2>
      <div className="flex flex-col gap-2">
        <Stat label="Tiles Owned" value={String(tilesOwned)} />
        <Stat label="Territory" value={`${percentage}%`} />
        <Stat label="Rank" value={rank ? `#${rank}` : "—"} />
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-gridwars-border/50 bg-gridwars-bg/40 px-3 py-2">
      <span className="text-xs text-gridwars-muted">{label}</span>
      <span className="font-mono text-lg font-semibold text-gridwars-text">
        {value}
      </span>
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono text-sm font-bold text-gridwars-text">{value}</span>
      <span className="text-xs text-gridwars-muted">{label}</span>
    </div>
  );
}
