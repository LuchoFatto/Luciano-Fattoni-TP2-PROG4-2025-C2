import { ConflictException, Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Crear un nuevo usuario
  async create(userData: Partial<User>): Promise<User> {
    // Verificamos que no exista correo o nombreUsuario duplicado
    const userExists = await this.userModel.findOne({
      $or: [
        { correo: userData.correo },
        { nombreUsuario: userData.nombreUsuario },
      ],
    });
    if (userExists) {
      throw new ConflictException('El correo o nombre de usuario ya existe');
    }

    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  // Buscar usuario por correo o nombreUsuario (para login)
  async findByLoginField(loginField: string): Promise<User | null> {
    return this.userModel.findOne({
      $or: [{ correo: loginField }, { nombreUsuario: loginField }],
    });
  }

  // Buscar usuario por ID
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }
}
