import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { Comment } from '../comments/schemas/comment.schema';

/**
 * Controller para estadísticas (solo admins)
 * Endpoints: /statistics/*
 */
@Controller('statistics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StatisticsController {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  /**
   * GET /statistics/posts-by-user
   * Retorna cantidad de publicaciones por usuario en rango de fechas
   * Query params: startDate (ISO), endDate (ISO)
   */
  @Get('posts-by-user')
  async getPostsByUser(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const matchStage: any = { activo: true };

    // Filtrar por rango de fechas si se proporcionan
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const result = await this.postModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$autor',
          totalPosts: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombreUsuario: '$usuario.nombreUsuario',
          imagenPerfil: '$usuario.imagenPerfil',
          totalPosts: 1,
        },
      },
      { $sort: { totalPosts: -1 } },
    ]);

    return {
      message: 'Estadísticas de publicaciones por usuario',
      startDate: startDate || null,
      endDate: endDate || null,
      data: result,
    };
  }

  /**
   * GET /statistics/comments-total
   * Retorna total de comentarios en rango de fechas
   * Query params: startDate (ISO), endDate (ISO)
   */
  @Get('comments-total')
  async getCommentsTotal(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const matchStage: any = {};

    // Filtrar por rango de fechas si se proporcionan
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const total = await this.commentModel.countDocuments(matchStage);

    return {
      message: 'Total de comentarios',
      startDate: startDate || null,
      endDate: endDate || null,
      total,
    };
  }

  /**
   * GET /statistics/posts-status
   * Retorna distribución de posts activos e inactivos
   */
  @Get('posts-status')
  async getPostsStatus() {
    const activos = await this.postModel.countDocuments({ activo: true });
    const inactivos = await this.postModel.countDocuments({ activo: false });

    return {
      message: 'Distribución de posts por estado',
      data: {
        activos,
        inactivos,
        total: activos + inactivos,
      },
    };
  }

  /**
   * GET /statistics/comments-by-post
   * Retorna cantidad de comentarios por publicación en rango de fechas
   * Query params: startDate (ISO), endDate (ISO)
   */
  @Get('comments-by-post')
  async getCommentsByPost(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const matchStage: any = {};

    // Filtrar por rango de fechas si se proporcionan
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const result = await this.commentModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$publicacion',
          totalComments: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: '$post' },
      {
        $project: {
          _id: 0,
          postId: '$_id',
          titulo: '$post.titulo',
          imagenUrl: '$post.imagenUrl',
          totalComments: 1,
        },
      },
      { $sort: { totalComments: -1 } },
    ]);

    return {
      message: 'Estadísticas de comentarios por publicación',
      startDate: startDate || null,
      endDate: endDate || null,
      data: result,
    };
  }

  /**
   * GET /statistics/posts-by-likes
   * Retorna publicaciones más populares ordenadas por cantidad de likes
   */
  @Get('posts-by-likes')
  async getPostsByLikes() {
    const result = await this.postModel.aggregate([
      { $match: { activo: true } },
      {
        $project: {
          _id: 1,
          titulo: 1,
          imagenUrl: 1,
          likesCount: { $size: '$likes' },
        },
      },
      { $sort: { likesCount: -1 } },
      { $limit: 10 }, // Top 10 posts más populares
    ]);

    return {
      message: 'Posts más populares por cantidad de likes',
      data: result,
    };
  }
}
