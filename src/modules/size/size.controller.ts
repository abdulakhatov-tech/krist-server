import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Delete,
  HttpCode,
  Controller,
  HttpStatus,
} from '@nestjs/common';
import { SizeService } from './size.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@Controller('sizes')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  @Get()
  async findAll() {
    return this.sizeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.sizeService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSizeDto: CreateSizeDto) {
    return this.sizeService.createSize(createSizeDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSizeDto: UpdateSizeDto) {
    return this.sizeService.editSize(id, updateSizeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sizeService.deleteSize(id);
  }
}
