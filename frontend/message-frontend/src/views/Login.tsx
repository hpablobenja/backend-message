import React, { useState } from 'react';
import { authService } from '../services/api.service';
import { useChat } from '../context/ChatContext';

export const Login: React.FC = () => {
  const { setToken } = useChat();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Flujo de Registro profesional
        await authService.register(phoneNumber, name, password);
        // Una vez registrado, procedemos a loguearlo automáticamente
      }
      
      // Flujo de Login para obtener el token JWT
      const data = await authService.login(phoneNumber, password);
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error en el proceso. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', background: '#f0f2f5', fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{
        background: '#fff', padding: '40px', borderRadius: '10px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)', width: '360px', textAlign: 'center'
      }}>
        <div style={{ color: '#00a884', fontSize: '48px', marginBottom: '10px' }}>💚</div>
        <h2 style={{ color: '#3b4a54', marginBottom: '20px' }}>
          {isRegister ? 'Crear cuenta en WhatsApp' : 'Iniciar Sesión'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isRegister && (
            <input
              type="text"
              placeholder="Tu Nombre Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
            />
          )}
          <input
            type="text"
            placeholder="Número de Teléfono (ej. +51999888777)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
          />
          
          {error && <p style={{ color: '#ea4335', fontSize: '13px', margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#00a884', color: '#fff', border: 'none', padding: '12px', 
              borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#667781' }}>
          {isRegister ? '¿Ya tienes una cuenta?' : '¿Eres nuevo?'} {' '}
          <span
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ color: '#00a884', cursor: 'pointer', fontWeight: 'semibold' }}
          >
            {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
          </span>
        </p>
      </div>
    </div>
  );
};