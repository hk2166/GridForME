type Props = {
  remaining: number;
  maxSeconds: number;
};

export function CooldownBar({ remaining, maxSeconds }: Props) {
  const progress = remaining > 0 ? (remaining / maxSeconds) * 100 : 0;

  return (
    <div className="w-full border-t border-gridwars-border bg-gridwars-panel px-4 py-3">
      <div className="flex items-center justify-between text-xs text-gridwars-muted">
        <span>Cooldown</span>
        <span>{remaining > 0 ? `${remaining}s` : "Ready"}</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gridwars-border">
        <div
          className="h-full rounded-full bg-gridwars-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}