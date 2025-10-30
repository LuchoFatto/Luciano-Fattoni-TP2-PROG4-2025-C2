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
}
