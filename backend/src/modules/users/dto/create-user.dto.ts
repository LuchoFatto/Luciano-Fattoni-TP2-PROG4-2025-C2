import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty() nombre: string;
  @IsNotEmpty() apellido: string;
  @IsEmail() correo: string;
  @IsNotEmpty() nombreUsuario: string;
  @MinLength(8) password: string;
  perfil?: string;
  fechaNacimiento?: string;
  descripcion?: string;
  imagenPerfil?: string;
}
