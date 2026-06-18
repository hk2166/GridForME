"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, getUserHeatmap, type StatsResponse } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { Heatmap } from "@/components/Heatmap";

// Grid dimensions — kept in sync with env. Could come from /api/grid but
// a static default is fine for the stats page.
const COLS = Number(process.env.NEXT_PUBLIC_GRID_COLS ?? 10);
const ROWS = Number(process.env.NEXT_PUBLIC_GRID_ROWS ?? 10);

export default function StatsPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [heatmap, setHeatmap] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError("Could not load stats"));
  }, []);

  useEffect(() => {
    if (!user) return;
    getUserHeatmap(user.id)
      .then(setHeatmap)
      .catch(() => {/* heatmap is optional — silently ignore */});
  }, [user]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-gridwars-bg px-6 py-12 text-gridwars-text">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gridwars-accent/20 blur-3xl animate-glow-drift" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-gridwars-accent2/15 blur-3xl animate-glow-drift [animation-delay:-6s]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-gradient animate-gradient-pan">
            Game Stats
          </h1>
          <Link
            href="/grid"
            className="rounded-xl border border-gridwars-border bg-gridwars-panel/60 px-4 py-2 text-sm text-gridwars-muted backdrop-blur transition-colors hover:text-gridwars-text"
          >
            ← Back to Grid
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-gridwars-danger/40 bg-gridwars-danger/10 px-5 py-4 text-gridwars-danger">
            {error}
          </div>
        ) : !stats ? (
          <div className="flex justify-center py-12">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-gridwars-border border-t-gridwars-accent" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Global stats grid */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gridwars-muted">
                Global
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Total Tiles" value={String(stats.totalTiles)} />
                <StatCard label="Claimed" value={String(stats.claimedTiles)} />
                <StatCard
                  label="Unclaimed"
                  value={String(stats.totalTiles - stats.claimedTiles)}
                />
                <StatCard
                  label="Claimed %"
                  value={
                    stats.totalTiles > 0
                      ? `${((stats.claimedTiles / stats.totalTiles) * 100).toFixed(1)}%`
                      : "0%"
                  }
                />
                <StatCard label="Total Captures" value={String(stats.totalCaptures)} />
                <StatCard label="Players Online" value={String(stats.onlineCount)} />
              </div>
            </section>

            {/* Personal heatmap */}
            {user && (
              <section className="rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 p-6 backdrop-blur-xl">
                <Heatmap
                  cols={COLS}
                  rows={ROWS}
                  counts={heatmap}
                  color={user.color}
                />
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 px-5 py-4 backdrop-blur-xl">
      <span className="text-xs text-gridwars-muted">{label}</span>
      <span className="font-mono text-2xl font-bold text-gridwars-text">
        {value}
      </span>
    </div>
  );
}
