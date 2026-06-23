import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ChatProvider } from './context/ChatContext';
import './index.css'; // Estilos base opcionales (puedes dejarlo vacío o con reseteo de márgenes)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);