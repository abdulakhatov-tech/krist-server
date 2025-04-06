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

import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Get('/slug/:slug/subcategories') 
  async findSubCategoriesByCategorySlug(@Param('slug') slug: string ) {
    return this.categoryService.findSubCategoriesByCategorySlug(slug);
  }

  
  @Get(':id/subcategories') 
  async findSubCategoriesByCategoryId(@Param('id') id: string ) {
    return this.categoryService.findSubCategoriesByCategoryId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updadateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updadateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
