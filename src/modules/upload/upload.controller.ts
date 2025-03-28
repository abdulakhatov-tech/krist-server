import { FileInterceptor } from '@nestjs/platform-express';
import {
  Post,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { storage } from 'src/config/cloudinary.storage.config';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadImage(file);
  }
}
