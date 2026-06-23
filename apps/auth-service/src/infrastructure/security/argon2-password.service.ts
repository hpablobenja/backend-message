import argon2 from 'argon2';
import { PasswordService } from '../../domain/services/password.interface';

export class Argon2PasswordService implements PasswordService {
  /**
   * Genera un hash seguro utilizando Argon2id (configuración por defecto altamente segura)
   */
  async hash(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id, // Combina resistencia a ataques de memoria y GPU
        memoryCost: 2 ** 16,   // 64 MB de memoria
        timeCost: 3,           // 3 iteraciones
        parallelism: 4,        // 4 hilos en paralelo
      });
    } catch (error) {
      throw new Error('Error interno al procesar la credencial de seguridad.');
    }
  }

  /**
   * Compara la contraseña en texto plano con el hash almacenado
   */
  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false; // Retornamos falso ante cualquier fallo para mitigar ataques de temporización
    }
  }
}