import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RegisterUserDto } from './dto/register-user.dto.ts/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async register(
    @Body() dto: RegisterUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagenPerfilUrl = file
      ? `/uploads/profile-images/${file.filename}`
      : '';
    const newUser = await this.authService.register(dto, imagenPerfilUrl);
    return {
      message: 'Usuario registrado correctamente',
      user: newUser,
    };
  }
}
