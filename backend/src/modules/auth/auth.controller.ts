import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  async register(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // Convertimos el body al DTO manualmente
    const createUserDto: CreateUserDto = {
      nombre: body.nombre,
      apellido: body.apellido,
      correo: body.correo,
      nombreUsuario: body.nombreUsuario,
      password: body.password,
      perfil: '',
      fechaNacimiento: body.fechaNacimiento,
      descripcion: body.descripcion,
      imagenPerfil: '',
    };

    return this.authService.register(createUserDto, file);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
