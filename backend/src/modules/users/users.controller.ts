import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { SupabaseService } from 'src/supabase/supabase.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * PUT /users/profile - Actualiza perfil del usuario logueado
   * Requiere autenticación pero no admin
   * IMPORTANTE: Debe estar ANTES de las rutas con :id para evitar conflictos
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  async updateProfile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const userId = req.user._id;

    const updateData: any = {};
    if (body.nombre) updateData.nombre = body.nombre;
    if (body.apellido) updateData.apellido = body.apellido;
    if (body.descripcion !== undefined)
      updateData.descripcion = body.descripcion;
    if (body.fechaNacimiento) updateData.fechaNacimiento = body.fechaNacimiento;

    // Actualizar usuario
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateData,
    );
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Subir nueva imagen si existe
    if (file) {
      const imageUrl = await this.supabaseService.uploadProfileImage(
        file,
        userId,
      );
      updatedUser.imagenPerfil = imageUrl;
      await updatedUser.save();
    }

    const { password: _, ...usuarioSinPassword } = updatedUser.toObject();

    return {
      message: 'Perfil actualizado correctamente',
      usuario: usuarioSinPassword,
    };
  }

  /**
   * GET /users - Lista todos los usuarios
   * Solo accesible por administradores
   */
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: 'Usuarios obtenidos correctamente',
      usuarios: users,
    };
  }

  /**
   * POST /users - Crear nuevo usuario (admin puede elegir perfil)
   * Solo accesible por administradores
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // Validar que el perfil sea válido
    const perfil = body.perfil || 'usuario';
    if (!['usuario', 'administrador'].includes(perfil)) {
      throw new NotFoundException('Perfil inválido');
    }

    const createUserDto: CreateUserDto = {
      nombre: body.nombre,
      apellido: body.apellido,
      correo: body.correo,
      nombreUsuario: body.nombreUsuario,
      password: body.password,
      perfil: perfil,
      fechaNacimiento: body.fechaNacimiento,
      descripcion: body.descripcion,
      imagenPerfil: '',
    };

    // Hash de password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear usuario
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Subir imagen si existe
    if (file) {
      const imageUrl = await this.supabaseService.uploadProfileImage(
        file,
        newUser._id as string,
      );
      newUser.imagenPerfil = imageUrl;
      await newUser.save();
    }

    const { password: _, ...usuarioSinPassword } = newUser.toObject();

    return {
      message: 'Usuario creado correctamente',
      usuario: usuarioSinPassword,
    };
  }

  /**
   * DELETE /users/:id - Deshabilita un usuario (baja lógica)
   * Solo accesible por administradores
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async disable(@Param('id') id: string) {
    const user = await this.usersService.disableUser(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password: _, ...usuarioSinPassword } = user.toObject();

    return {
      message: 'Usuario deshabilitado correctamente',
      usuario: usuarioSinPassword,
    };
  }

  /**
   * POST /users/:id/activate - Rehabilita un usuario (alta lógica)
   * Solo accesible por administradores
   */
  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async enable(@Param('id') id: string) {
    const user = await this.usersService.enableUser(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password: _, ...usuarioSinPassword } = user.toObject();

    return {
      message: 'Usuario habilitado correctamente',
      usuario: usuarioSinPassword,
    };
  }
}
