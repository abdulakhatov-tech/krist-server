import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Post('create')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Patch('edit/:slug')
  async updateCategory(@Param('slug') slug: string, @Body() updadateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.updateCategory(slug, updadateCategoryDto)
  }

  @Delete('delete/:slug')
  async deleteCategory(@Param('slug') slug: string) {
    return this.categoryService.deleteCategory(slug);
  }
}
