// apps/chat-service/src/infrastructure/sockets/socket-adapter.ts
import { Server } from 'socket.io';
import { RedisEventBus } from '../broker/redis-event-bus';

export class SocketAdapter {
  constructor(
    private readonly io: Server,
    private readonly eventBus: RedisEventBus
  ) {}

  /**
   * Inicializa la escucha de eventos globales de Redis para transmitirlos
   * a los clientes locales conectados a este contenedor de Docker.
   */
  public registerBrokers(): void {
    // Escuchamos el canal global de mensajes nuevos
    this.eventBus.subscribe('REDIS_CHAT_MESSAGE', (message: any) => {
      this.forwardToLocalUser(message.receiverId, 'new_message', message);
    });

    // Escuchamos el canal global de actualizaciones de estado (entregado/leído)
    this.eventBus.subscribe('REDIS_MESSAGE_STATUS', (statusUpdate: any) => {
      this.forwardToLocalUser(statusUpdate.senderId, 'status_updated', statusUpdate);
    });
  }

  /**
   * Intenta enviar el evento al usuario solo si está conectado en este hilo de Node.js
   */
  private forwardToLocalUser(userId: string, eventName: string, payload: any): void {
    // Buscamos en las habitaciones internas de Socket.io correspondientes al userId
    const userRoom = `user:${userId}`;
    
    // El método 'to' de Socket.io es seguro: si no hay nadie conectado en esta sala local, no hace nada
    this.io.to(userRoom).emit(eventName, payload);
  }
}