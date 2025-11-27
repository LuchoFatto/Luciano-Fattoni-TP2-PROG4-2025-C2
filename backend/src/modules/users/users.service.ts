import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findByEmailOrUsername(correo: string, nombreUsuario: string) {
    return this.userModel.findOne({
      $or: [{ correo }, { nombreUsuario }],
    });
  }

  async findByEmailOrUsernameLogin(identifier: string) {
    return this.userModel.findOne({
      $or: [{ correo: identifier }, { nombreUsuario: identifier }],
    });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  /**
   * Actualiza el perfil del usuario logueado
   */
  async updateProfile(id: string, updateData: any) {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    // Actualizar campos permitidos
    if (updateData.nombre !== undefined) user.nombre = updateData.nombre;
    if (updateData.apellido !== undefined) user.apellido = updateData.apellido;
    if (updateData.descripcion !== undefined)
      user.descripcion = updateData.descripcion;
    if (updateData.fechaNacimiento !== undefined)
      user.fechaNacimiento = updateData.fechaNacimiento;

    return user.save();
  }

  // =============================
  //   MÉTODOS ADMIN
  // =============================

  /**
   * Lista todos los usuarios (sin passwords)
   */
  async findAll() {
    return this.userModel.find().select('-password').exec();
  }

  /**
   * Deshabilita un usuario (baja lógica)
   */
  async disableUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    user.activo = false;
    return user.save();
  }

  /**
   * Habilita un usuario (alta lógica)
   */
  async enableUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    user.activo = true;
    return user.save();
  }
}
