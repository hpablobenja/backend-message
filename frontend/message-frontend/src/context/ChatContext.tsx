import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: string;
}

interface OnlineUser {
  userId: string;
  phoneNumber: string;
}

interface ChatContextType {
  socket: Socket | null;
  messages: Message[];
  sendMessage: (receiverId: string, text: string) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  userId: string | null;
  phoneNumber: string | null;
  onlineUsers: OnlineUser[];
  getHistory: (recipientId: string) => void;
  activeChat: string | null;
  setActiveChat: (chatId: string | null) => void;
  chatMessages: Map<string, Message[]>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt'));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Map<string, Message[]>>(new Map());

  useEffect(() => {
    if (!token) {
      if (socket) socket.disconnect();
      setUserId(null);
      return;
    }

    // Extraer userId y phoneNumber del token y localStorage
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId || payload.sub);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setPhoneNumber(user.phoneNumber);
      }
    } catch (e) {
      console.error('Error decoding token:', e);
      return;
    }

    // Conexión al servicio de chat usando Socket.io
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      query: { userId: userId || '', phoneNumber: phoneNumber || '' }
    });

    newSocket.on('connect', () => {
      console.log('Conectado exitosamente al chat-service');
    });
    
    newSocket.on('new_message', (incomingMessage: Message) => {
      setMessages((prev) => [...prev, incomingMessage]);
      // Also add to the specific chat's message list
      setChatMessages((prev) => {
        const chatId = incomingMessage.senderId === userId ? incomingMessage.receiverId : incomingMessage.senderId;
        const updated = new Map(prev);
        const existing = updated.get(chatId) || [];
        updated.set(chatId, [...existing, incomingMessage]);
        return updated;
      });
    });

    newSocket.on('online_users', (data: { users: OnlineUser[] }) => {
      setOnlineUsers(data.users);
    });

    newSocket.on('user_online', (data: { userId: string, phoneNumber: string, timestamp: string }) => {
      setOnlineUsers((prev) => [...prev, { userId: data.userId, phoneNumber: data.phoneNumber }]);
    });

    newSocket.on('user_offline', (data: { userId: string, phoneNumber: string, timestamp: string }) => {
      setOnlineUsers((prev) => prev.filter(user => user.userId !== data.userId));
    });

    newSocket.on('chat_history', (data: { messages: Message[], recipientId: string }) => {
      setChatMessages((prev) => {
        const updated = new Map(prev);
        // Don't reverse - messages come from MongoDB sorted by timestamp descending (newest first)
        // We want oldest at top, newest at bottom, so we reverse to get ascending order
        updated.set(data.recipientId, data.messages.reverse());
        return updated;
      });
    });

    newSocket.on('message_ack', (data: { messageId: string; status: string }) => {
      console.log('Mensaje acknowledged:', data);
    });

    newSocket.on('error_response', (error: { message: string }) => {
      console.error('Error del chat-service:', error.message);
    });

    newSocket.on('disconnect', () => {
      console.log('Conexión de WebSocket finalizada');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, userId]);

  const sendMessage = (receiverId: string, text: string) => {
    if (socket && socket.connected) {
      socket.emit('send_message', {
        receiverId,
        content: text
      });
      // Añadir localmente el mensaje enviado por el Usuario A
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: userId || 'me',
        receiverId,
        content: text,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      setMessages((prev) => [...prev, tempMessage]);
      // Also add to the specific chat's message list
      setChatMessages((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(receiverId) || [];
        updated.set(receiverId, [...existing, tempMessage]);
        return updated;
      });
    }
  };

  const getHistory = (recipientId: string) => {
    if (socket && socket.connected) {
      socket.emit('get_history', { recipientId, limit: 50, offset: 0 });
    }
  };

  const handleSetActiveChat = (chatId: string | null) => {
    setActiveChat(chatId);
    if (chatId) {
      getHistory(chatId);
    }
  };

  return (
    <ChatContext.Provider value={{ socket, messages, sendMessage, token, setToken, userId, phoneNumber, onlineUsers, getHistory, activeChat, setActiveChat: handleSetActiveChat, chatMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat debe ser usado dentro de un ChatProvider');
  return context;
};