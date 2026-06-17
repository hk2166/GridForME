"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, type StatsResponse } from "@/lib/api";

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError("Could not load stats"));
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gridwars-bg px-6 py-12 text-gridwars-text">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gridwars-accent/20 blur-3xl animate-glow-drift" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-gridwars-accent2/15 blur-3xl animate-glow-drift [animation-delay:-6s]" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
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
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Tiles" value={String(stats.totalTiles)} />
            <StatCard label="Claimed Tiles" value={String(stats.claimedTiles)} />
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
