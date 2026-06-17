import type { LeaderboardEntry } from "@/lib/api";

type Props = {
  entries: LeaderboardEntry[];
};

export function Leaderboard({ entries }: Props) {
  return (
    <aside className="w-72 border-l border-gridwars-border bg-gridwars-panel p-4">
      <h2 className="font-display text-lg font-semibold">Leaderboard</h2>

      <div className="mt-4 space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between rounded border border-gridwars-border bg-gridwars-bg px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-gridwars-muted">#{entry.rank}</span>
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.userName}</span>
            </div>

            <span className="font-mono text-gridwars-muted">
              {entry.tileCount}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}