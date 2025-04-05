import {
  Post,
  Controller,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

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

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('images', 5, { storage, limits: { files: 5 } }),
  ) 
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images were uploaded. Please select at least one image.');
    }
    if (files.length > 4) {
      throw new BadRequestException('You can upload a maximum of 4 images at a time.');
    }

    return this.uploadService.uploadMultipleImages(files);
  }
}
