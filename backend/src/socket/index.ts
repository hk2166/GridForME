import type http from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { getGridTiles, captureTileRealtime } from "../services/gridService";
import { prisma } from "../db/prisma";
import { redis } from "../db/redis";

type JoinPayload = {
  userId: string;
  name: string;
  color: string;
};

type CapturePayload = {
  tileId: number;
  userId: string;
  userName: string;
  color: string;
};

const ONLINE_USERS_KEY = "online:users";

export function initializeSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("user:join", async (payload: JoinPayload) => {
      await redis.sAdd(ONLINE_USERS_KEY, socket.id);

      await redis.hSet(`user:session:${socket.id}`, {
        userId: payload.userId,
        name: payload.name,
        color: payload.color
      });

      const tiles = await getGridTiles();

      socket.emit("grid:init", {
        tiles
      });

      const onlineCount = await redis.sCard(ONLINE_USERS_KEY);

      io.emit("online:count", {
        count: onlineCount
      });
    });

    socket.on("tile:capture", async (payload: CapturePayload) => {
      try {
        const tile = await captureTileRealtime(payload);

        io.emit("tile:updated", tile);

        prisma.capture
          .create({
            data: {
              tileId: tile.id,
              userId: payload.userId,
              userName: payload.userName,
              color: payload.color,
              wasSteal: false
            }
          })
          .catch((error) => {
            console.error("Failed to persist capture", error);
          });
      } catch (error) {
        socket.emit("capture:error", {
          tileId: payload.tileId,
          reason: "conflict",
          message: error instanceof Error ? error.message : "Capture failed"
        });
      }
    });

    socket.on("disconnect", async () => {
      await redis.sRem(ONLINE_USERS_KEY, socket.id);
      await redis.del(`user:session:${socket.id}`);

      const onlineCount = await redis.sCard(ONLINE_USERS_KEY);

      io.emit("online:count", {
        count: onlineCount
      });

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}