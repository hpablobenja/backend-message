import React from 'react';
import { useChat } from './context/ChatContext';
import { Login } from './views/Login';
import { ChatDashboard } from './views/ChatDashboard';

export const App: React.FC = () => {
  const { token } = useChat();

  // Si el usuario no está autenticado, se le muestra la pantalla de Login
  if (!token) {
    return <Login />;
  }

  // Si tiene un token válido, el sistema levanta automáticamente el WebSocket y abre el chat
  return <ChatDashboard />;
};