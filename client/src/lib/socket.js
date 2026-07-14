import { io } from 'socket.io-client';
import { ADMIN_TOKEN_KEY } from './api';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      autoConnect: false,
      auth: { token: localStorage.getItem(ADMIN_TOKEN_KEY) || '' }
    });
  }
  return socket;
}
