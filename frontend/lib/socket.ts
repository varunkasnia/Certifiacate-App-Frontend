import { io, Socket } from "socket.io-client";

import { SOCKET_URL } from "@/lib/api";

export function createSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
  });
}
