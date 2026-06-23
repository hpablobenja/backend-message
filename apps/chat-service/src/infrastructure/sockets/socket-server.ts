// apps/chat-service/src/infrastructure/sockets/socket-server.ts
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { SocketHandler } from './socket-handler';
import { RedisEventBus } from '../broker/redis-event-bus';
import { SendMessageUseCase } from '../../application/send-message.usecase';
import { GetHistoryUseCase } from '../../application/get-history.usecase';

export class SocketServer {
  private io: Server;

  constructor(
    server: HttpServer,
    private readonly eventBus: RedisEventBus,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase
  ) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // En producción, restringe a los dominios de tu cliente/app móvil
        methods: ['GET', 'POST']
      },
      transports: ['websocket'] // Forzamos WebSockets puro para optimizar performance en Docker
    });
  }

  public init(): void {
    const handler = new SocketHandler(this.io, this.eventBus, this.sendMessageUseCase, this.getHistoryUseCase);
    handler.setupListeners();
  }
}