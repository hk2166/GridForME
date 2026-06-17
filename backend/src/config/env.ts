import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  GRID_COLS: Number(process.env.GRID_COLS ?? 40),
  GRID_ROWS: Number(process.env.GRID_ROWS ?? 25),
  CAPTURE_COOLDOWN_SECONDS: Number(process.env.CAPTURE_COOLDOWN_SECONDS ?? 5),
  GRID_RESET_SECRET: process.env.GRID_RESET_SECRET ?? "",
  DATABASE_URL: required("DATABASE_URL"),
  REDIS_URL: required("REDIS_URL")
};