import express from 'express';
import cors from 'cors';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { EnvConfig } from './infrastructure/config/env.validator';
import { PostgresUserRepository } from './infrastructure/database/repositories/postgres-user.repository';
import { Argon2PasswordService } from './infrastructure/security/argon2-password.service';
import { JwtTokenService } from './infrastructure/security/jwt-token.service';

async function bootstrap() {
  console.log('🚀 Inicializando auth-service en modo:', EnvConfig.NODE_ENV);

  // 1. Instanciar la Infraestructura (Adaptadores de Salida)
  const userRepository = new PostgresUserRepository();
  const passwordService = new Argon2PasswordService();
  const tokenService = new JwtTokenService();

  // 2. Instanciar la Aplicación (Casos de Uso)
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordService);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordService, tokenService);

  // 3. Inicializar el Servidor HTTP (Adaptador de Entrada)
  const app = express();
  
  // Configurar CORS para permitir requests del frontend
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  }));
  
  app.use(express.json()); // Habilitar lectura de JSON en el body

  // Rutas de prueba rápidas (Aquí conectarías tu AuthController real más adelante)
  app.post('/auth/register', async (req, res) => {
    try {
      const { password, ...rest } = req.body;
      const result = await registerUserUseCase.execute({
        ...rest,
        passwordPlain: password || rest.passwordPlain,
      });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { password, ...rest } = req.body;
      const result = await loginUserUseCase.execute({
        ...rest,
        passwordPlain: password || rest.passwordPlain,
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  // 4. CRÍTICO: El método .listen() mantiene a Node.js escuchando activamente en segundo plano
  const server = app.listen(EnvConfig.PORT, () => {
    console.log(`✅ Servidor escuchando exitosamente en el puerto ${EnvConfig.PORT}`);
  });

  // Control de cierre limpio (Graceful Shutdown) para Docker
  process.on('SIGTERM', () => {
    console.log('Recibida señal SIGTERM. Cerrando servidor de forma limpia...');
    server.close(() => {
      console.log('Servidor HTTP cerrado con éxito.');
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  console.error('❌ Error crítico en el bootstrap del sistema:', err);
  process.exit(1);
});