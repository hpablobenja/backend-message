import { z } from 'zod';
import dotenv from 'dotenv';

// Cargar el archivo .env
dotenv.config();

// Definimos el esquema de validación con tipos estrictos
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL debe ser una URL de conexión válida' }),
  JWT_SECRET: z.string().min(32, { message: 'JWT_SECRET debe tener al menos 32 caracteres por seguridad' }),
  JWT_EXPIRES_IN: z.string().default('1d'),
});

// Intentar validar las variables de entorno actuales
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Error crítico: Configuración de entorno inválida:');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1); // Detiene la aplicación de inmediato si falta algo
}

// Exportamos las variables tipadas y validadas
export const EnvConfig = result.data;
export type EnvConfigType = z.infer<typeof envSchema>;