import { io } from 'socket.io-client';

const socket = io(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001',
  {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  }
);

socket.on('connect', () => {
  console.log('🔗 Connected to server');
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

export default socket; 