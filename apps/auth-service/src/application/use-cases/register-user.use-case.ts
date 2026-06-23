import { User } from '../../domain/entities/user.entity';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordService } from '../../domain/services/password.interface';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UserMapper, UserResponseDto } from '../dtos/user-response.dto';

export class RegisterUserUseCase {
  // Recibe las implementaciones de infraestructura mediante los puertos de dominio
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(dto: RegisterUserDto): Promise<UserResponseDto> {
    // 1. Validar si el usuario ya existe por número de teléfono
    const existingUser = await this.userRepository.findByPhoneNumber(dto.phoneNumber);
    if (existingUser) {
      throw new DomainException('El número de teléfono ya se encuentra registrado.');
    }

    // 2. Delegar el hashing de la contraseña al puerto correspondiente
    const passwordHash = await this.passwordService.hash(dto.passwordPlain);

    // 3. Crear la entidad de Dominio (aquí se autoejecutan las validaciones del dominio)
    const newUser = new User({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      passwordHash: passwordHash,
    });

    // 4. Guardar la entidad en el repositorio
    const savedUser = await this.userRepository.save(newUser);

    // 5. Retornar el DTO de salida formateado y seguro
    return UserMapper.toResponse(savedUser);
  }
}