import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      query: { userId },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Event listeners
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('newMessage', callback);
  }

  onOnlineUsers(callback: (users: string[]) => void) {
    this.socket?.on('getOnlineUsers', callback);
  }

  // Remove listeners
  offNewMessage() {
    this.socket?.off('newMessage');
  }

  offOnlineUsers() {
    this.socket?.off('getOnlineUsers');
  }
}

export const socketService = new SocketService();
export default socketService;