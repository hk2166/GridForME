type Props = {
  count: number;
};

export function OnlineCount({ count }: Props) {
  return (
    <div className="flex items-center gap-2 rounded border border-gridwars-border px-3 py-2 text-sm text-gridwars-muted">
      <span className="h-2 w-2 rounded-full bg-gridwars-success" />
      <span>{count} online</span>
    </div>
  );
}