import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // crea createdAt y updatedAt automáticamente
export class User {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, unique: true })
  nombreUsuario: string;

  @Prop({ required: true })
  contraseña: string;

  @Prop()
  fechaNacimiento: Date;

  @Prop()
  descripcion: string;

  @Prop()
  imagenPerfil: string; // URL o path local

  @Prop({ default: 'usuario' })
  perfil: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
