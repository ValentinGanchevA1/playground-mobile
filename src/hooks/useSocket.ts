// src/hooks/useSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from './redux';
import { addMessage } from '../features/chat/chatSlice';
import { updateNearbyUser, setUserOnline } from '../features/map/mapSlice';

const SOCKET_URL = __DEV__ ? 'http://10.0.2.2:3001' : 'https://api.g88.app';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  const connect = useCallback(async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;

    socketRef.current = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('message:receive', (message) => {
      dispatch(addMessage(message));
    });

    socketRef.current.on('nearby:update', (data) => {
      dispatch(updateNearbyUser(data));
    });

    socketRef.current.on('user:online', ({ userId }) => {
      dispatch(setUserOnline(userId));
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }, [dispatch]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const sendMessage = useCallback((recipientId: string, content: string, type = 'text') => {
    socketRef.current?.emit('message:send', { recipientId, content, type });
  }, []);

  const updateLocation = useCallback((lat: number, lng: number) => {
    socketRef.current?.emit('location:update', { lat, lng });
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { sendMessage, updateLocation, isConnected: !!socketRef.current?.connected };
};
