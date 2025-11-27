import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @Post('authorize')
  @UseGuards(JwtAuthGuard)
  authorize(@Req() req: any) {
    return this.authService.authorizeFromUser(req.user);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@Req() req: any) {
    return this.authService.refreshFromUser(req.user);
  }
}
