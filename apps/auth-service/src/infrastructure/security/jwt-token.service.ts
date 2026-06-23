import jwt from 'jsonwebtoken';
import { TokenService } from '../../application/use-cases/login-user.use-case';
import { EnvConfig } from '../config/env.validator';

export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly expiresIn: string | number;

  constructor() {
    this.secret = EnvConfig.JWT_SECRET;
    this.expiresIn = EnvConfig.JWT_EXPIRES_IN ?? '1h';
  }

  /**
   * Genera un token firmado criptográficamente con los datos mínimos del usuario
   */
  async generateToken(payload: { userId: string; phoneNumber: string }): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.secret,
        {
          algorithm: 'HS256',
          // SOLUCIÓN: Casteamos directamente como jwt.SignOptions['expiresIn'] eliminando el riesgo de undefined indeseado
          expiresIn: this.expiresIn as any, 
        },
        (err, token) => {
          if (err || !token) {
            return reject(new Error('Error al generar el token de acceso.'));
          }
          resolve(token);
        }
      );
    });
  }
}