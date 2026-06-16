import { createClient } from "redis";
import { env } from "../config/env";

export const redis = createClient({
  url: env.REDIS_URL,
  // Keep the connection alive so Upstash doesn't drop it while idle.
  pingInterval: 30000,
  socket: {
    // Auto-reconnect with backoff instead of hanging on a dead connection.
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    keepAlive: true
  }
});

redis.on("error", (error) => {
  console.error("Redis error fix the Redis URL related issues", error);
});