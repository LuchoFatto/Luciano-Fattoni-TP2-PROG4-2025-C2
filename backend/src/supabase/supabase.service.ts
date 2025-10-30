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
    const fileName = `profiles/${userId}-${Date.now()}-${file.originalname}`;
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
}
