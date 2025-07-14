import { io } from 'socket.io-client';

const socket = io('/', {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

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