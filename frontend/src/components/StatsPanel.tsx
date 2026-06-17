type Props = {
  tilesOwned: number;
  rank: number | null;
  totalTiles: number;
};

export function StatsPanel({ tilesOwned, rank, totalTiles }: Props) {
  const percentage =
    totalTiles > 0 ? ((tilesOwned / totalTiles) * 100).toFixed(1) : "0.0";

  return (
    <aside className="flex w-48 shrink-0 flex-col gap-3 rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 p-4 backdrop-blur-xl">
      <h2 className="font-display text-sm font-semibold text-gridwars-muted uppercase tracking-wider">
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
