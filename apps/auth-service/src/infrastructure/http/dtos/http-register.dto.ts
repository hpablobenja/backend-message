import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class HttpRegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono es requerido.' })
  // Expresión regular idéntica a la del dominio para evitar discrepancias
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'El número de teléfono debe incluir el código de país (ej: +5411234567).',
  })
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  passwordPlain!: string;
}