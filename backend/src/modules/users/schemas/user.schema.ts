import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, unique: true })
  nombreUsuario: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'usuario' })
  perfil: string;

  @Prop()
  fechaNacimiento: string;

  @Prop()
  descripcion: string;

  @Prop()
  imagenPerfil: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
