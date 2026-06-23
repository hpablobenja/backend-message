// apps/chat-service/src/infrastructure/database/mongoose-client.ts
import mongoose from 'mongoose';
import { env } from '../config/environment';

export class MongooseClient {
  private static isConnected = false;

  public static async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('MongoDB ya está conectado (Reutilizando pool).');
      return;
    }

    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      console.log('Conexión exitosa a MongoDB en Docker.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Error crítico en la conexión de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      console.warn('MongoDB desconectado. Intentando reconexión...');
    });

    await mongoose.connect(env.MONGO_URI, {
      autoIndex: true, // Crea los índices definidos en los esquemas automáticamente
    });
  }

  public static async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
    }
  }
}