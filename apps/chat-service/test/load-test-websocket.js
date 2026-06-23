import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Rampa de subida: 100 usuarios virtuales conectados
    { duration: '1m', target: 500 },   // Estrés: Subimos a 500 usuarios enviando ráfagas
    { duration: '30s', target: 0 },    // Rampa de bajada: Desconexión progresiva
  ],
};

export default function () {
  // Generamos un ID aleatorio para simular usuarios únicos ingresando por el handshake
  const userId = `user_${Math.floor(Math.random() * 100000)}`;
  const url = `ws://localhost:3001/?userId=${userId}`;

  const res = ws.connect(url, null, function (socket) {
    socket.on('open', function () {
      console.log(`[VU ${__VU}] Conectado exitosamente`);

      // Enviamos un mensaje cada 2 segundos simulando comportamiento humano en chat
      socket.setInterval(function () {
        const payload = JSON.stringify({
          receiverId: 'user_destino_test',
          content: 'Hola, esto es una prueba de carga masiva con k6 🚀'
        });
        
        socket.send(payload);
      }, 2000);
    });

    // Validamos que el servidor responda los ACKs (confirmaciones de entrega)
    socket.on('message', function (data) {
      const msg = JSON.parse(data);
      check(msg, {
        'mensaje recibido o ack confirmado': (m) => m.status === 'sent' || m.id !== undefined,
      });
    });

    socket.on('close', () => console.log('Conexión cerrada'));
    socket.on('error', (e) => console.error('Error en WebSocket:', e.error()));

    // Cada usuario virtual permanece activo durante 20 segundos antes de reciclarse
    socket.setTimeout(function () {
      socket.close();
    }, 20000);
  });

  check(res, { 'status es 101 (Switching Protocols)': (r) => r && r.status === 101 });
}