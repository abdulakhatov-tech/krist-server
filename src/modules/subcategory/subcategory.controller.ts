import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { CreateSubCategoryDto, EditSubCategoryDto } from './dto';
import { SubcategoryService } from './subcategory.service';

@Controller('subcategories')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Get()
  async findAll() {
    return this.subcategoryService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.subcategoryService.findBySlug(slug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subcategoryService.createSubCategory(createSubCategoryDto);
  }

  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() editSubCategoryDto: EditSubCategoryDto,
  ) {
    return this.subcategoryService.editSubCategory(slug, editSubCategoryDto);
  }

  @Delete(':slug')
  async remove(@Param('slug') slug: string) {
    return this.subcategoryService.deleteSubCategory(slug);
  }
}
