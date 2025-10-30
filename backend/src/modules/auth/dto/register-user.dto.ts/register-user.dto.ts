import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsEmail()
  correo: string;

  @IsString()
  @IsNotEmpty()
  nombreUsuario: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).*$/, {
    message:
      'La contraseña debe tener al menos una mayúscula, un número y 8 caracteres',
  })
  contraseña: string;

  @IsString()
  @IsNotEmpty()
  repetirContraseña: string;

  @IsOptional()
  fechaNacimiento?: Date;

  @IsOptional()
  descripcion?: string;
}
