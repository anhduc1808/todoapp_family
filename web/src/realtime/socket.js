import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://family-todoapp-backend-production.up.railway.app'

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
  forceNew: false,
})

// Error handling
socket.on('connect_error', (error) => {
  if (import.meta.env.DEV) {
    console.error('Socket connection error:', error)
  }
})

socket.on('disconnect', (reason) => {
  if (import.meta.env.DEV) {
    console.log('Socket disconnected:', reason)
  }
})

socket.on('reconnect', (attemptNumber) => {
  if (import.meta.env.DEV) {
    console.log('Socket reconnected after', attemptNumber, 'attempts')
  }
})

export default socket
