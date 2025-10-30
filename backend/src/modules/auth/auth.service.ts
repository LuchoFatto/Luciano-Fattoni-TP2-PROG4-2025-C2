import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto.ts/register-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema/user.schema';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(
    dto: RegisterUserDto,
    imagenPerfilUrl?: string,
  ): Promise<User> {
    if (dto.contraseña !== dto.repetirContraseña) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const hashedPassword = await bcrypt.hash(dto.contraseña, 10);

    try {
      const newUser = await this.usersService.create({
        ...dto,
        contraseña: hashedPassword,
        imagenPerfil: imagenPerfilUrl || '',
      });
      return newUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
