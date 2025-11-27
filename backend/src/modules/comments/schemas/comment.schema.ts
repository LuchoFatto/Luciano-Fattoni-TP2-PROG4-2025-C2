import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: false })
  modificado: boolean;

  @Prop({ default: true })
  activo: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
