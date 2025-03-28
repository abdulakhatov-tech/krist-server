import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Get(':slug/subcategories') 
  async findSubCategoriesByCategorySlug(@Param('slug') slug: string ) {
    return this.categoryService.findSubCategoriesByCategorySlug(slug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updadateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(slug, updadateCategoryDto);
  }

  @Delete(':slug')
  async remove(@Param('slug') slug: string) {
    return this.categoryService.deleteCategory(slug);
  }
}
