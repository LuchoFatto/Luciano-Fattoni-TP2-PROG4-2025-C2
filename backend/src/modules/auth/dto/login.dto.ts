import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty() identifier: string; // correo o nombreUsuario
  @IsNotEmpty() password: string;
}
