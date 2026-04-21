import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../constants';

export const useSocket = (userId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Use BASE_URL and strip /api if necessary to connect to the Node server root
    const serverUrl = BASE_URL.replace('/api', '');
    
    socketRef.current = io(serverUrl);

    socketRef.current.on('connect', () => {
      console.log('🔗 WebSocket connected');
      socketRef.current?.emit('join', userId);
    });

    return () => {
      console.log('🔗 WebSocket disconnecting');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
};
