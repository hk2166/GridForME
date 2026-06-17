// Centralised client-side config read from NEXT_PUBLIC_* env vars.
// Change values in .env (and .env.example); never hardcode them in components.

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  captureCooldownSeconds: Number(
    process.env.NEXT_PUBLIC_CAPTURE_COOLDOWN_SECONDS ?? 5
  )
} as const;
