// apps/chat-service/src/infrastructure/broker/redis-event-bus.ts
import Redis from 'ioredis';
import { env } from '../config/environment';

export class RedisEventBus {
  private pubClient: Redis;
  private subClient: Redis;

  constructor() {
    const redisOptions = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null,
    };

    // Necesitamos instancias separadas para publicar y suscribir debido al protocolo de Redis
    this.pubClient = new Redis(redisOptions);
    this.subClient = new Redis(redisOptions);

    this.pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err));
    this.subClient.on('error', (err) => console.error('Redis Sub Client Error:', err));
  }

  // Publicar un evento (ej: un mensaje nuevo) hacia todo el ecosistema de Docker
  async publish(channel: string, payload: any): Promise<void> {
    const messageString = JSON.stringify(payload);
    await this.pubClient.publish(channel, messageString);
  }

  // Suscribirse a un canal para escuchar mensajes de otras instancias
  async subscribe(channel: string, callback: (payload: any) => void): Promise<void> {
    await this.subClient.subscribe(channel);
    
    this.subClient.on('message', (subChannel, message) => {
      if (subChannel === channel) {
        try {
          const parsedPayload = JSON.parse(message);
          callback(parsedPayload);
        } catch (error) {
          console.error(`Error procesando mensaje en canal ${channel}:`, error);
        }
      }
    });
  }

  async disconnect(): Promise<void> {
    await this.pubClient.quit();
    await this.subClient.quit();
  }
}