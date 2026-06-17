"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { GridCanvas } from "@/components/GridCanvas";

export default function GridPage() {
  const router = useRouter();
  const { user, isReady, clearUser } = useUser();

  // All hooks must come before any early return — React's Rules of Hooks.
  useEffect(() => {
    if (isReady && !user) {
      router.replace("/");
    }
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <main className="flex h-screen items-center justify-center bg-gridwars-bg">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-gridwars-border border-t-gridwars-accent" />
      </main>
    );
  }

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-gridwars-bg px-6 py-6 text-gridwars-text">
      {/* Ambient animated background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gridwars-accent/20 blur-3xl animate-glow-drift" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-gridwars-accent2/15 blur-3xl animate-glow-drift [animation-delay:-6s]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-gridwars-accent3/10 blur-3xl animate-glow-drift [animation-delay:-12s]" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col gap-5">
        <header className="flex shrink-0 items-center justify-between rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 px-4 py-3 backdrop-blur-xl animate-fade-in sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-xl font-bold leading-none text-gradient animate-gradient-pan sm:text-2xl">
                GridWars
              </h1>
              <p className="mt-1 hidden text-xs text-gridwars-muted sm:block">
                Claim your territory. In real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-gridwars-border/70 bg-gridwars-bg/40 px-3 py-1.5 text-sm sm:px-4 sm:py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gridwars-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gridwars-success" />
            </span>
            <span className="max-w-[80px] truncate font-medium sm:max-w-none">{user.name}</span>
            <span
              className="h-4 w-4 shrink-0 rounded-md"
              style={{
                backgroundColor: user.color,
                boxShadow: `0 0 10px ${user.color}99`,
              }}
            />
            <button
              type="button"
              onClick={() => {
                clearUser();
                router.replace("/");
              }}
              className="ml-1 text-xs text-gridwars-muted transition-colors hover:text-gridwars-text"
              title="Change identity"
            >
              ✕
            </button>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 items-center justify-center animate-fade-in [animation-delay:120ms]">
          <GridCanvas user={user} />
        </section>

        <footer className="flex shrink-0 items-center justify-center gap-4 rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 px-4 py-2.5 text-xs text-gridwars-muted backdrop-blur-xl animate-fade-in [animation-delay:200ms] sm:gap-6 sm:px-5 sm:py-3">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-gridwars-tile" />
            <span className="hidden sm:inline">Unclaimed</span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded"
              style={{
                backgroundColor: user.color,
                boxShadow: `0 0 8px ${user.color}99`,
              }}
            />
            <span className="hidden sm:inline">Yours</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-gridwars-border bg-gridwars-bg/60 px-1.5 py-0.5 font-mono">
              click
            </kbd>
            to capture
          </span>
        </footer>
      </div>
    </main>
  );
}
