import { env } from "../config/env";
import { redis } from "../db/redis";

function cooldownKey(userId: string) {
  return `user:cooldown:${userId}`;
}

export async function reserveCaptureCooldown(userId: string) {
  const script = `
    local key = KEYS[1]
    local seconds = tonumber(ARGV[1])

    local ok = redis.call("SET", key, "1", "EX", seconds, "NX")

    if ok then
      return 0
    end

    return redis.call("TTL", key)
  `;

  const result = await redis.eval(script, {
    keys: [cooldownKey(userId)],
    arguments: [String(env.CAPTURE_COOLDOWN_SECONDS)]
  });

  const retryAfter = Number(result);

  return {
    allowed: retryAfter === 0,
    retryAfter: retryAfter > 0 ? retryAfter : 0
  };
}

export async function clearCaptureCooldown(userId: string) {
  await redis.del(cooldownKey(userId));
}