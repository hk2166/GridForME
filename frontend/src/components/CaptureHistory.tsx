import type { GridTile } from "@/lib/api";

export type CaptureEvent = {
  tile: GridTile;
  at: number;
};

type Props = {
  events: CaptureEvent[];
};

export function CaptureHistory({ events }: Props) {
  return (
    <aside className="flex w-48 shrink-0 flex-col gap-2 rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 p-4 backdrop-blur-xl">
      <h2 className="shrink-0 font-display text-sm font-semibold uppercase tracking-wider text-gridwars-muted">
        Live Feed
      </h2>

      {events.length === 0 ? (
        <p className="text-xs text-gridwars-muted/60">No captures yet</p>
      ) : (
        <ul className="flex flex-col gap-1 overflow-y-auto">
          {events.map((ev) => (
            <li
              key={`${ev.tile.id}-${ev.at}`}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-gridwars-border/40 bg-gridwars-bg/40 px-2.5 py-1.5 text-xs animate-fade-in"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: ev.tile.color ?? "#555" }}
              />
              <span className="min-w-0 flex-1 truncate font-medium text-gridwars-text">
                {ev.tile.ownerName}
              </span>
              {ev.tile.wasSteal && (
                <span className="shrink-0 text-[10px] font-semibold text-gridwars-accent3">
                  steal
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
