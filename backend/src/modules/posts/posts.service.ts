import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { FilterPostsDto } from './dto/filter.posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Crear una nueva publicacion
  async create(
    dto: CreatePostDto,
    autorId: string,
    file?: Express.Multer.File,
  ) {
    const nueva = new this.postModel({
      ...dto,
      autor: new Types.ObjectId(autorId),
    });

    if (file) {
      const imagenUrl = await this.supabaseService.uploadPostImage(
        file,
        nueva._id.toString(),
      );
      nueva.imagenUrl = imagenUrl;
    }

    return nueva.save();
  }

  // Listar publicaciones (orden, filtro, paginación)
  async findAll(filtros: FilterPostsDto) {
    const { orden, usuario, limit = 10, offset = 0 } = filtros;

    const query: any = { activo: true };

    // Convertir string | ObjectId SOLO si viene usuario
    if (usuario) {
      query.autor = new Types.ObjectId(usuario);
    }

    // Ordenamiento
    const sort: any = orden === 'likes' ? { likes: -1 } : { createdAt: -1 };

    const publicaciones = await this.postModel
      .find(query)
      .sort(sort)
      .skip(Number(offset))
      .limit(Number(limit))
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();

    return publicaciones;
  }

  // Obtener una publicación por ID
  async findOne(postId: string, userId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('ID de publicación inválido');
    }

    const post = await this.postModel
      .findById(postId)
      .populate('autor', 'nombreUsuario imagenPerfil')
      .exec();

    if (!post || !post.activo) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return post;
  }

  // Baja logica
  async softDelete(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const isOwner = post.autor.toString() === userId;
    if (!isOwner)
      throw new ForbiddenException('No tienes permiso para eliminar este post');

    post.activo = false;
    await post.save();

    return { message: 'Publicación eliminada correctamente' };
  }

  // Agregar me gusta
  async addLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');
    if (!post.activo)
      throw new ForbiddenException('Esta publicación fue eliminada');

    const alreadyLiked = post.likes.some(
      (likeId) => likeId.toString() === userId,
    );
    if (alreadyLiked) {
      throw new BadRequestException('Ya diste me gusta a esta publicación');
    }

    post.likes.push(new Types.ObjectId(userId));
    await post.save();

    return {
      message: 'Me gusta agregado correctamente',
      totalLikes: post.likes.length,
    };
  }

  //Sacar me gusta
  async removeLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');
    if (!post.activo)
      throw new ForbiddenException('Esta publicación fue eliminada');

    const likedIndex = post.likes.findIndex(
      (likeId) => likeId.toString() === userId,
    );
    if (likedIndex === -1)
      throw new BadRequestException(
        'No habías dado me gusta a esta publicación',
      );

    post.likes.splice(likedIndex, 1);
    await post.save();

    return {
      message: 'Me gusta eliminado correctamente',
      totalLikes: post.likes.length,
    };
  }
}
