import { User } from '../../domain/entities/user.entity';

export interface UserResponseDto {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
}

// Mapper estático para transformar la entidad de dominio al DTO de salida
export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    if (!user.id) {
      throw new Error('No se puede mapear un usuario sin un Identificador único (ID).');
    }
    
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt.toISOString(),
    };
  }
}