import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../posts/schemas/post.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  // ============================
  //          GET
  // ============================
  async getComments(postId: string, limit = 10, offset = 0) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('ID de publicación inválido');
    }

    const postExists = await this.postModel.exists({
      _id: postId,
      activo: true,
    });
    if (!postExists) throw new NotFoundException('Publicación no encontrada');

    const comments = await this.commentModel
      .find({ post: new Types.ObjectId(postId), activo: true })
      .sort({ createdAt: -1 }) // Más recientes primero
      .skip(Number(offset))
      .limit(Number(limit))
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();

    return comments;
  }

  // ============================
  //          CREATE
  // ============================
  async createComment(
    postId: string,
    usuarioId: string,
    dto: CreateCommentDto,
  ) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('ID de publicación inválido');
    }

    const postExists = await this.postModel.exists({
      _id: postId,
      activo: true,
    });
    if (!postExists) throw new NotFoundException('Publicación no encontrada');

    const nuevo = new this.commentModel({
      post: new Types.ObjectId(postId),
      autor: new Types.ObjectId(usuarioId),
      mensaje: dto.mensaje,
    });

    await nuevo.save();

    // Populate para devolver autor completo
    return this.commentModel
      .findById(nuevo._id)
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();
  }

  // ============================
  //          UPDATE
  // ============================
  async updateComment(
    commentId: string,
    usuarioId: string,
    dto: UpdateCommentDto,
  ) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('ID de comentario inválido');
    }

    const comment = await this.commentModel.findById(commentId);
    if (!comment || !comment.activo)
      throw new NotFoundException('Comentario no encontrado');

    const isOwner = comment.autor.toString() === usuarioId;
    if (!isOwner)
      throw new ForbiddenException(
        'No puedes editar comentarios de otros usuarios',
      );

    comment.mensaje = dto.mensaje;
    comment.modificado = true;

    await comment.save();

    // Populate para devolver autor completo
    return this.commentModel
      .findById(comment._id)
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();
  }

  // ============================
  //          DELETE
  // ============================
  async deleteComment(commentId: string, usuarioId: string) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('ID de comentario inválido');
    }

    const comment = await this.commentModel.findById(commentId);
    if (!comment || !comment.activo)
      throw new NotFoundException('Comentario no encontrado');

    const isOwner = comment.autor.toString() === usuarioId;
    if (!isOwner)
      throw new ForbiddenException(
        'No puedes eliminar comentarios de otros usuarios',
      );

    comment.activo = false;
    await comment.save();

    return { message: 'Comentario eliminado correctamente' };
  }
}
