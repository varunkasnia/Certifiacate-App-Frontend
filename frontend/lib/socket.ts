import { io, Socket } from 'socket.io-client';
import socketio

# Ensure your Vercel URL is allowed to connect
sio = socketio.AsyncServer(
    async_mode='asgi', 
    cors_allowed_origins=['https://unaiquizzfinal.vercel.app', 'http://localhost:3000'] 
)

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
