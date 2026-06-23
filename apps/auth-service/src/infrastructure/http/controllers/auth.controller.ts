import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';
import { HttpRegisterDto } from '../dtos/http-register.dto';
import { UserResponseDto } from '../../../application/dtos/user-response.dto';

@Controller('auth')
export class AuthController {
  // Las dependencias de los Casos de Uso se inyectan automáticamente aquí
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: HttpRegisterDto): Promise<UserResponseDto> {
    // Convertimos el DTO de HTTP al DTO agnóstico de la aplicación
    return await this.registerUserUseCase.execute({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      passwordPlain: dto.passwordPlain,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: any) { // Puedes crear un HttpLoginDto similar
    return await this.loginUserUseCase.execute({
      phoneNumber: dto.phoneNumber,
      passwordPlain: dto.passwordPlain,
    });
  }
}