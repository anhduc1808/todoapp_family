import { io } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://family-todoapp-backend-production.up.railway.app';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;
