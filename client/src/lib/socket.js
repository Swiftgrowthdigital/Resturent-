import { io } from 'socket.io-client';
import { ADMIN_TOKEN_KEY } from './api';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      autoConnect: false,
      auth: (callback) => callback({ token: localStorage.getItem(ADMIN_TOKEN_KEY) || '' }),
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 750,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.35,
      timeout: 10000
    });
  }
  return socket;
}

export function subscribeDashboard(socket = getSocket()) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return;
  socket.emit('dashboard:subscribe', token);
}
