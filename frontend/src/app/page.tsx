"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";


const PRESET_COLORS = [
  "#22C55E", "#3B82F6", "#EF4444", "#F59E0B",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
  "#06B6D4", "#84CC16", "#E879F9", "#FB923C",
];

export default function LandingPage() {
  const router = useRouter();
  const { user, isReady, saveUser } = useUser();

  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // Auto-redirect: if user already exists, skip the landing page
  useEffect(() => {
    if (isReady && user) {
      router.replace("/grid");
    }
  }, [isReady, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    saveUser(trimmedName, color);
    router.push("/grid");
  }

  
  
  if (!isReady || user) {
    return (
      <main className="flex h-screen items-center justify-center bg-gridwars-bg">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-gridwars-border border-t-gridwars-accent" />
      </main>
    );
  }

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-gridwars-bg text-gridwars-text">
      {/* Ambient background glows — same style as the grid page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gridwars-accent/20 blur-3xl animate-glow-drift" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-gridwars-accent2/15 blur-3xl animate-glow-drift [animation-delay:-6s]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-gridwars-accent3/10 blur-3xl animate-glow-drift [animation-delay:-12s]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex w-full max-w-md flex-col gap-6 rounded-3xl border border-gridwars-border/70 bg-gridwars-panel/60 p-6 backdrop-blur-xl animate-fade-in sm:gap-8 sm:p-8"
      >
        {/* Title */}
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-gradient animate-gradient-pan">
            GridWars
          </h1>
          <p className="mt-2 text-sm text-gridwars-muted">
            Claim your territory. In real time.
          </p>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="player-name" className="text-sm font-medium text-gridwars-muted">
            Player Name
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            autoFocus
            className="rounded-xl border border-gridwars-border bg-gridwars-bg/60 px-4 py-3 text-gridwars-text placeholder-gridwars-muted/50 outline-none transition-all focus:border-gridwars-accent focus:ring-2 focus:ring-gridwars-accent/30"
          />
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gridwars-muted">
            Choose colors to capture tiles
          </label>

          {/* Preset palette */}
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={[
                  "h-9 w-9 rounded-lg transition-all duration-150",
                  color === preset
                    ? "scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-gridwars-panel"
                    : "hover:scale-105 hover:ring-1 hover:ring-white/40",
                ].join(" ")}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-gridwars-border bg-transparent"
            />
            <span className="font-mono text-xs text-gridwars-muted">
              {color.toUpperCase()} — or pick a custom color
            </span>
          </div>
        </div>

        {/* Preview + Submit */}
        <div className="flex flex-col gap-4">
          {/* Live preview of what you'll look like */}
          <div className="flex items-center gap-3 rounded-xl border border-gridwars-border/50 bg-gridwars-bg/40 px-4 py-3">
            <span
              className="h-5 w-5 rounded-md shadow-lg"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 12px ${color}88`,
              }}
            />
            <span className="text-sm font-medium">
              {name.trim() || "Your Name"}
            </span>
            <span className="ml-auto text-xs text-gridwars-muted">Preview</span>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-xl bg-gridwars-accent px-6 py-3 font-display font-semibold text-white transition-all hover:bg-gridwars-accent/80 hover:shadow-lg hover:shadow-gridwars-accent/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enter the Grid →
          </button>
        </div>
      </form>
    </main>
  );
}
