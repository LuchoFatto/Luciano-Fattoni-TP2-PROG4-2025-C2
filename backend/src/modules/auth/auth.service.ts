import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private buildTokenPayload(user: any) {
    return {
      sub: user._id,
      correo: user.correo,
      nombreUsuario: user.nombreUsuario,
      perfil: user.perfil,
    };
  }

  async register(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const { correo, nombreUsuario, password } = createUserDto;

    const existingUser = await this.usersService.findByEmailOrUsername(
      correo,
      nombreUsuario,
    );
    if (existingUser)
      throw new BadRequestException(
        'El correo o nombre de usuario ya está en uso',
      );

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      perfil: 'usuario',
      imagenPerfil: '',
    });

    if (file) {
      const imageUrl = await this.supabaseService.uploadProfileImage(
        file,
        newUser._id as string,
      );
      newUser.imagenPerfil = imageUrl;
      await newUser.save();
    }

    const { password: _, ...usuarioSinPassword } = newUser.toObject();

    const payload = this.buildTokenPayload(newUser);
    const token = this.jwtService.sign(payload);

    return {
      message: 'Usuario registrado correctamente',
      token,
      usuario: usuarioSinPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;
    const user = await this.usersService.findByEmailOrUsernameLogin(identifier);
    if (!user)
      throw new UnauthorizedException('Usuario o contraseña inválidos');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new UnauthorizedException('Usuario o contraseña inválidos');

    const payload = this.buildTokenPayload(user);
    const token = this.jwtService.sign(payload);

    const { password: _, ...usuarioSinPassword } = user.toObject();

    return { message: 'Login exitoso', token, usuario: usuarioSinPassword };
  }

  // =============================
  //   VALIDAR TOKEN (desde req.user ya validado)
  // =============================
  async authorizeFromUser(userPayload: any) {
    const user = await this.usersService.findById(userPayload.userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const { password, ...usuarioSinPassword } = user.toObject();

    return {
      message: 'Token válido',
      usuario: usuarioSinPassword,
    };
  }

  // =============================
  //   REFRESCAR TOKEN (desde req.user ya validado)
  // =============================
  async refreshFromUser(userPayload: any) {
    const newToken = this.jwtService.sign({
      sub: userPayload.userId,
      correo: userPayload.correo,
      nombreUsuario: userPayload.nombreUsuario,
      perfil: userPayload.perfil,
    });

    return {
      message: 'Token refrescado',
      token: newToken,
    };
  }
}
