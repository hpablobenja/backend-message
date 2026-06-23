// apps/chat-service/src/main.ts
import http from 'http';
import { env } from './infrastructure/config/environment';
import { MongooseClient } from './infrastructure/database/mongoose-client';
import { RedisEventBus } from './infrastructure/broker/redis-event-bus';
import { MongoMessageRepository } from './infrastructure/repositories/mongo-message.repository';
import { SendMessageUseCase } from './application/send-message.usecase';
import { GetHistoryUseCase } from './application/get-history.usecase';
import { SocketServer } from './infrastructure/sockets/socket-server';

async function bootstrap() {
  try {
    // 1. Conectar Bases de Datos e Infraestructura
    await MongooseClient.connect();
    
    const eventBus = new RedisEventBus();
    console.log('Conectado a Redis Pub/Sub exitosamente.');

    // 2. Acoplar Capas (Inyección de Dependencias)
    const messageRepository = new MongoMessageRepository();
    const sendMessageUseCase = new SendMessageUseCase(messageRepository);
    const getHistoryUseCase = new GetHistoryUseCase(messageRepository);

    // 3. Inicializar Servidores de Red
    const server = http.createServer();
    const socketServer = new SocketServer(server, eventBus, sendMessageUseCase, getHistoryUseCase);
    
    socketServer.init();

    // 4. Encender Servidor
    const PORT = env.PORT;
    server.listen(PORT, () => {
      console.log(`[Chat Service] ejecutándose en tiempo real sobre el puerto ${PORT}`);
    });

    // Manejo de apagado limpio (Graceful Shutdown) para Docker
    const shutdown = async () => {
      console.log('Cerrando conexiones de forma limpia...');
      server.close();
      await eventBus.disconnect();
      await MongooseClient.disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Fallo crítico en el inicio de chat-service:', error);
    process.exit(1);
  }
}

bootstrap();