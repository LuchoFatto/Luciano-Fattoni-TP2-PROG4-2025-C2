import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterPostsDto {
  @IsOptional()
  @IsString()
  orden?: 'fecha' | 'likes';

  @IsOptional()
  @IsString()
  usuario?: string; // ID de usuario para filtrar publicaciones

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string; // Paginación
}
