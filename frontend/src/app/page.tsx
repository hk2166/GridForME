import { GridCanvas } from "@/components/GridCanvas";

export default function Home() {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-gridwars-bg px-6 py-8 text-gridwars-text">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6">
        <header className="flex shrink-0 items-center justify-between border-b border-gridwars-border pb-4">
          <div>
            <h1 className="font-display text-3xl font-bold">GridWars</h1>
            <p className="text-sm text-gridwars-muted">
              Claim your territory. In real time.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gridwars-muted">
            <span className="h-3 w-3 rounded-full bg-gridwars-accent" />
            Demo Player
          </div>
        </header>

        <section className="flex min-h-0 flex-1 justify-center">
          <GridCanvas />
        </section>
      </div>
    </main>
  );
}