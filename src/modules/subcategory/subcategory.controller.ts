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

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.subcategoryService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subcategoryService.createSubCategory(createSubCategoryDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() editSubCategoryDto: EditSubCategoryDto,
  ) {
    return this.subcategoryService.editSubCategory(id, editSubCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.subcategoryService.deleteSubCategory(id);
  }
}
