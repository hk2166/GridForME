"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RulesModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md animate-fade-in rounded-3xl border border-gridwars-border/70 bg-gridwars-panel/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="rules-title"
            className="font-display text-xl font-bold text-gradient animate-gradient-pan"
          >
            How to Play
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gridwars-muted transition-colors hover:text-gridwars-text"
            aria-label="Close rules"
          >
            ✕
          </button>
        </div>

        <ol className="flex flex-col gap-4">
          <Rule
            n="1"
            title="Claim tiles"
            body="Click any unclaimed (dark) tile on the grid to capture it in your color."
          />
          <Rule
            n="2"
            title="Cooldown"
            body={`After each capture there's a short cooldown. Watch the bar at the bottom — when it empties you can capture again.`}
          />
          <Rule
            n="3"
            title="Steal tiles"
            body="You can capture tiles already owned by other players. They can take them back too — that's the game."
          />
        </ol>

        <div className="mt-6 rounded-xl border border-gridwars-border/50 bg-gridwars-bg/40 px-4 py-3 text-xs text-gridwars-muted">
          <p className="font-semibold text-gridwars-text mb-1">Tile legend</p>
          <div className="flex flex-wrap gap-3 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-gridwars-tile" /> Unclaimed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-gridwars-accent" /> Yours
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-gridwars-accent3" /> Other players
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-gridwars-accent2 ring-1 ring-white/20" /> Recently captured
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-gridwars-accent px-4 py-2.5 font-display font-semibold text-white transition-all hover:bg-gridwars-accent/80"
        >
          Let&apos;s play →
        </button>
      </div>
    </div>
  );
}

function Rule({
  n,
  title,
  body
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gridwars-accent/20 font-display text-sm font-bold text-gridwars-accent">
        {n}
      </span>
      <div>
        <p className="font-semibold text-gridwars-text">{title}</p>
        <p className="mt-0.5 text-sm text-gridwars-muted">{body}</p>
      </div>
    </li>
  );
}
