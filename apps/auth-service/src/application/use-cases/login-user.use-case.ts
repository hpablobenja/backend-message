import { DomainException } from '../../domain/exceptions/domain.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordService } from '../../domain/services/password.interface';
import { UserMapper, UserResponseDto } from '../dtos/user-response.dto';

export interface LoginDto {
  phoneNumber: string;
  passwordPlain: string;
}

export interface LoginResponseDto {
  user: UserResponseDto;
  accessToken: string; // En infraestructura inyectaremos el generador de JWT real
}

// Interfaz para el servicio de tokens (usualmente va en application/ports o domain/services)
export interface TokenService {
  generateToken(payload: { userId: string; phoneNumber: string }): Promise<string>;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponseDto> {
    // 1. Buscar que el usuario exista
    const user = await this.userRepository.findByPhoneNumber(dto.phoneNumber);
    if (!user) {
      throw new DomainException('Credenciales incorrectas.'); // Error ambiguo por seguridad
    }

    // 2. Verificar la contraseña utilizando el servicio criptográfico
    const isPasswordValid = await this.passwordService.compare(
      dto.passwordPlain,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new DomainException('Credenciales incorrectas.');
    }

    // 3. Generar el token de acceso
    const accessToken = await this.tokenService.generateToken({
      userId: user.id!,
      phoneNumber: user.phoneNumber,
    });

    // 4. Devolver respuesta profesional unificada
    return {
      user: UserMapper.toResponse(user),
      accessToken,
    };
  }
}