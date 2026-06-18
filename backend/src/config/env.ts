import dotenv from "dotenv";

dotenv.config();

function normalizeOrigin(value: string): string {
  let s = value.trim();

  // Strip surrounding quotes (Render sometimes injects them)
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1);
  }

  // Strip trailing slash — browsers send origins without one
  s = s.replace(/\/+$/, "");

  return s;
}

// Keep backward-compat alias used by required()
function stripQuotes(value: string): string {
  return normalizeOrigin(value);
}

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return stripQuotes(value);
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean),
  GRID_COLS: Number(process.env.GRID_COLS ?? 40),
  GRID_ROWS: Number(process.env.GRID_ROWS ?? 25),
  CAPTURE_COOLDOWN_SECONDS: Number(process.env.CAPTURE_COOLDOWN_SECONDS ?? 5),
  GRID_RESET_SECRET: process.env.GRID_RESET_SECRET ?? "",
  DATABASE_URL: required("DATABASE_URL"),
  REDIS_URL: required("REDIS_URL")
};