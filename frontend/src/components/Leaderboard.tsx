import type { LeaderboardEntry } from "@/lib/api";

type Props = {
  entries: LeaderboardEntry[];
};

export function Leaderboard({ entries }: Props) {
  return (
    <aside className="flex w-48 shrink-0 flex-col gap-2 rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 p-4 backdrop-blur-xl">
      <h2 className="shrink-0 font-display text-sm font-semibold uppercase tracking-wider text-gridwars-muted">
        Leaderboard
      </h2>

      {entries.length === 0 ? (
        <p className="text-xs text-gridwars-muted/60">No players yet</p>
      ) : (
        <ul className="flex min-h-0 flex-col gap-1 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.userId}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-gridwars-border/40 bg-gridwars-bg/40 px-2.5 py-1.5 text-xs"
            >
              <span className="shrink-0 font-mono text-gridwars-muted">
                #{entry.rank}
              </span>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="min-w-0 flex-1 truncate font-medium text-gridwars-text">
                {entry.userName}
              </span>
              <span className="shrink-0 font-mono text-gridwars-muted">
                {entry.tileCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
