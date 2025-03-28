import { Injectable } from '@nestjs/common';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<ResponseType<{ image_url: string }>> {
    return {
      success: true,
      message: 'ok',
      data: {
        image_url: file?.path,
      },
    };
  }
}
