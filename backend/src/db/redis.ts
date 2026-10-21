import { createClient } from "redis";
import { env } from "../config/env";

const redisUrl = new URL(env.REDIS_URL);

export const redis = createClient({
  url: env.REDIS_URL,
  // Keep the connection alive so the provider doesn't drop it while idle.
  pingInterval: 30000,
  socket: {
    // Auto-reconnect with backoff instead of hanging on a dead connection.
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    keepAlive: true,
    // Layerbase routes every Redis DB on port 6379 by TLS SNI hostname, and
    // Node doesn't send SNI for a bare rediss:// URL, so set it explicitly.
    ...(redisUrl.protocol === "rediss:" && {
      tls: true,
      servername: redisUrl.hostname
    })
  }
});

redis.on("error", (error) => {
  console.error("Redis error fix the Redis URL related issues", error);
});
