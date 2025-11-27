import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async uploadProfileImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    const sanitized = this.sanitizeFileName(file.originalname);
    const fileName = `profiles/${userId}-${Date.now()}-${sanitized}`;
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype,
      });

    if (error) throw new InternalServerErrorException('Error al subir imagen');

    const { data: publicUrlData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async uploadPostImage(
    file: Express.Multer.File,
    postId: string,
  ): Promise<string> {
    const sanitized = this.sanitizeFileName(file.originalname);
    const fileName = `posts/${postId}-${Date.now()}-${sanitized}`;

    const { data, error } = await this.supabase.storage
      .from('posts')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException('Error al subir imagen del post');
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('posts')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  private sanitizeFileName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-_ ]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
}
