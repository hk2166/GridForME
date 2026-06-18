"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function handleConnect() {
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Connect only when this hook is mounted (i.e. on the grid page).
    // Disconnect when unmounted so the online count stays accurate.
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      // Disconnect when leaving the grid page so the server
      // fires the disconnect event and removes from online count.
      socket.disconnect();
    };
  }, []);

  return { socket, isConnected };
}