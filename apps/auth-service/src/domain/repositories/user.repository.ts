import { User } from '../entities/user.entity';

export interface UserRepository {
  /**
   * Guarda un nuevo usuario en el sistema.
   */
  save(user: User): Promise<User>;

  /**
   * Busca un usuario por su número de teléfono exclusivo.
   */
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;

  /**
   * Busca un usuario por su Identificador único.
   */
  findById(id: string): Promise<User | null>;
}