import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Authenticate the WebSocket connection
      ws.send(JSON.stringify({ type: 'auth', userId: user.id }));
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Chat connection established",
      });
    };

    ws.onclose = () => {
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Chat connection lost",
        variant: "destructive",
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Error",
        description: "Chat connection error",
        variant: "destructive",
      });
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [user, toast]);

  const sendMessage = (receiverId: number, message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        senderId: user.id,
        receiverId,
        message,
      }));
      return true;
    }
    return false;
  };

  return {
    isConnected,
    sendMessage,
    socket: wsRef.current,
  };
}
