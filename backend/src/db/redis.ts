import { createClient } from "redis";
import { env } from "../config/env";

export const redis = createClient({
  url: env.REDIS_URL
});

redis.on("error", (error) => {
  console.error("Redis error fix the Redis URL related issues", error);
});