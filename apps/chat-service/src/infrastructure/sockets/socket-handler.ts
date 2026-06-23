// apps/chat-service/src/infrastructure/sockets/socket-handler.ts
import { Server, Socket } from 'socket.io';
import { RedisEventBus } from '../broker/redis-event-bus';
import { SendMessageUseCase } from '../../application/send-message.usecase';
import { GetHistoryUseCase } from '../../application/get-history.usecase';

export class SocketHandler {
  // Mapa en memoria para rastrear qué usuarios están conectados a ESTA instancia de Docker
  private connectedUsers = new Map<string, { socketId: string, phoneNumber: string }>(); // userId -> { socketId, phoneNumber }

  constructor(
    private readonly io: Server,
    private readonly eventBus: RedisEventBus,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase
  ) {}

  public setupListeners(): void {
    // 1. Escuchar eventos inter-proceso desde Redis (Otras instancias de Docker)
    this.eventBus.subscribe('REDIS_CHAT_MESSAGE', (payload: any) => {
      const targetUserData = this.connectedUsers.get(payload.receiverId);
      if (targetUserData) {
        this.io.to(targetUserData.socketId).emit('new_message', payload);
      }
    });

    // 2. Escuchar conexiones directas de los clientes de WhatsApp
    this.io.on('connection', (socket: Socket) => {
      // Simulamos la extracción del userId mediante el handshake (ej: cargado en auth middleware)
      const userId = socket.handshake.query.userId as string;
      const phoneNumber = socket.handshake.query.phoneNumber as string;
      
      if (!userId) {
        socket.disconnect();
        return;
      }

      this.connectedUsers.set(userId, { socketId: socket.id, phoneNumber: phoneNumber || userId });
      console.log(`Usuario conectado: ${userId} (${phoneNumber}) en socket ${socket.id}`);
      
      // Broadcast to all users that this user is online with phone number
      this.io.emit('user_online', { userId, phoneNumber: phoneNumber || userId, timestamp: new Date().toISOString() });
      
      // Send list of online users to the newly connected user with phone numbers
      const onlineUsers = Array.from(this.connectedUsers.entries())
        .filter(([id]) => id !== userId)
        .map(([id, data]) => ({ userId: id, phoneNumber: data.phoneNumber }));
      socket.emit('online_users', { users: onlineUsers });

      // Evento: El usuario envía un mensaje nuevo
      socket.on('send_message', async (data: { receiverId: string, content: string }) => {
        try {
          // Ejecutamos el caso de uso (Persistencia en Mongo)
          const message = await this.sendMessageUseCase.execute({
            senderId: userId,
            receiverId: data.receiverId,
            content: data.content
          });

          // Intentar entrega local (Si el receptor está en esta misma instancia)
          const recipientUserData = this.connectedUsers.get(data.receiverId);
          if (recipientUserData) {
            this.io.to(recipientUserData.socketId).emit('new_message', message);
          } else {
            // Si no está en esta réplica, lo lanzamos a Redis para que las demás instancias lo verifiquen
            await this.eventBus.publish('REDIS_CHAT_MESSAGE', message);
          }

          // Confirmar al emisor que el mensaje fue procesado con éxito
          socket.emit('message_ack', { messageId: message.id, status: 'sent' });

        } catch (error: any) {
          socket.emit('error_response', { message: error.message });
        }
      });

      // Evento: Obtener historial de mensajes
      socket.on('get_history', async (data: { recipientId: string, limit?: number, offset?: number }) => {
        try {
          const history = await this.getHistoryUseCase.execute({
            userId,
            recipientId: data.recipientId,
            limit: data.limit || 50,
            offset: data.offset || 0
          });
          socket.emit('chat_history', { messages: history, recipientId: data.recipientId });
        } catch (error: any) {
          socket.emit('error_response', { message: error.message });
        }
      });

      // Evento: Desconexión del cliente
      socket.on('disconnect', () => {
        const userData = this.connectedUsers.get(userId);
        this.connectedUsers.delete(userId);
        console.log(`Usuario desconectado: ${userId}`);
        // Broadcast to all users that this user is offline with phone number
        this.io.emit('user_offline', { userId, phoneNumber: userData?.phoneNumber || userId, timestamp: new Date().toISOString() });
      });
    });
  }
}