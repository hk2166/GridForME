import { GridCanvas } from "@/components/GridCanvas";

export default function Home() {
  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-gridwars-bg px-6 py-6 text-gridwars-text">
      {/* Ambient animated background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gridwars-accent/20 blur-3xl animate-glow-drift" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-gridwars-accent2/15 blur-3xl animate-glow-drift [animation-delay:-6s]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-gridwars-accent3/10 blur-3xl animate-glow-drift [animation-delay:-12s]" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col gap-5">
        <header className="flex shrink-0 items-center justify-between rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 px-5 py-4 backdrop-blur-xl animate-fade-in">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="font-display text-2xl font-bold leading-none text-gradient animate-gradient-pan">
                GridWars
              </h1>
              <p className="mt-1 text-xs text-gridwars-muted">
                Claim your territory. In real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-gridwars-border/70 bg-gridwars-bg/40 px-4 py-2 text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gridwars-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gridwars-success" />
            </span>
            <span className="font-medium">Demo Player</span>
            <span className="h-4 w-4 rounded-md bg-gridwars-success shadow-[0_0_10px] shadow-gridwars-success/60" />
          </div>
        </header>

        <section className="flex min-h-0 flex-1 items-center justify-center animate-fade-in [animation-delay:120ms]">
          <GridCanvas />
        </section>

        <footer className="flex shrink-0 items-center justify-center gap-6 rounded-2xl border border-gridwars-border/70 bg-gridwars-panel/60 px-5 py-3 text-xs text-gridwars-muted backdrop-blur-xl animate-fade-in [animation-delay:200ms]">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-gridwars-tile" /> Unclaimed
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-gridwars-success shadow-[0_0_8px] shadow-gridwars-success/60" />
            Yours
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <kbd className="rounded border border-gridwars-border bg-gridwars-bg/60 px-1.5 py-0.5 font-mono">
              click
            </kbd>
            to capture a tile
          </span>
        </footer>
      </div>
    </main>
  );
}
