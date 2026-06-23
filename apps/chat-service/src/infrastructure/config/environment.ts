// apps/chat-service/src/infrastructure/config/environment.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // URIs de las bases de datos NoSQL e Infraestructura
  MONGO_URI: z.string().url({ message: "MONGO_URI inválida o ausente" }),
  REDIS_HOST: z.string().min(1, { message: "REDIS_HOST es requerido" }),
  REDIS_PORT: z.string().transform((val) => parseInt(val, 10)).default('6379'),
});

// Exportamos las variables completamente validadas y tipadas
export const env = envSchema.parse(process.env);