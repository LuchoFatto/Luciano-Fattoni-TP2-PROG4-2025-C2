import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FilterPostsDto } from './dto/filter.posts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Crear publicación
  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePostDto,
    @Req() req: any,
  ) {
    const userId = req.user._id;
    return this.postsService.create(dto, userId, file);
  }

  // Listar publicaciones (filtradas / ordenadas / paginadas)
  @Get()
  findAll(@Query() filtros: FilterPostsDto) {
    return this.postsService.findAll(filtros);
  }

  // Obtener una publicación por ID
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;
    return this.postsService.findOne(id, userId);
  }

  // Baja lógica (dueño o admin)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const { _id: userId, perfil } = req.user;
    return this.postsService.softDelete(id, userId, perfil);
  }

  //Agregar me gusta
  @Post(':id/like')
  addLike(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;
    return this.postsService.addLike(id, userId);
  }

  //Sacar me gusta
  @Delete(':id/like')
  removeLike(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;
    return this.postsService.removeLike(id, userId);
  }
}
