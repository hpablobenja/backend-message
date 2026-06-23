import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

export const ChatDashboard: React.FC = () => {
  const { sendMessage, setToken, userId, phoneNumber, onlineUsers, activeChat, setActiveChat, chatMessages } = useChat();
  const [inputText, setInputText] = useState<string>('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    sendMessage(activeChat, inputText);
    setInputText('');
  };

  const handleContactClick = (contactId: string) => {
    setActiveChat(contactId);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Columna Izquierda: Contactos */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', background: '#f0f2f5', padding: '15px' }}>
        <h3>Chats</h3>
        <input 
          type="text" 
          placeholder="Número del destinatario..." 
          value={activeChat || ''}
          onChange={(e) => setActiveChat(e.target.value)}
          style={{ width: '90%', padding: '8px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        {/* Lista de usuarios en línea */}
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ fontSize: '14px', color: '#667781', marginBottom: '10px' }}>Usuarios en línea ({onlineUsers.length})</h4>
          {onlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.userId}
              onClick={() => handleContactClick(onlineUser.userId)}
              style={{
                padding: '10px',
                background: activeChat === onlineUser.userId ? '#d9fdd3' : '#fff',
                borderRadius: '5px',
                marginBottom: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{ width: '10px', height: '10px', background: '#00a884', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px' }}>{onlineUser.phoneNumber}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px', background: activeChat ? '#e9edef' : 'transparent', borderRadius: '5px' }}>
          {activeChat ? `Conversando con: ${activeChat}` : 'Seleccione o escriba un contacto'}
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#667781' }}>
          Tu número: {phoneNumber || 'No disponible'}
        </div>
        <button 
          onClick={() => { localStorage.clear(); setToken(null); }} 
          style={{ marginTop: '50px', background: '#ea4335', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Columna Derecha: Mensajes */}
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column', background: '#efeae2' }}>
        {/* Historial de Mensajes */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(chatMessages.get(activeChat || '') || []).map((msg, index) => {
              const isMe = msg.senderId === userId;
              return (
                <div key={msg.id || index} style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  background: isMe ? '#d9fdd3' : '#fff',
                  padding: '8px 12px',
                  borderRadius: '7px',
                  maxWidth: '60%',
                  boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)'
                }}>
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <span style={{ fontSize: '10px', color: '#667781', float: 'right' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Input de Envío */}
        <form onSubmit={handleSend} style={{ background: '#f0f2f5', padding: '15px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Escribe un mensaje aquí"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }}
          />
          <button type="submit" style={{ background: '#00a884', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};