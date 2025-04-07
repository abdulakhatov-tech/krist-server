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
  Query,
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

  @Get('/all')
    async findAllWithPagination(
      @Query('page') page: string,
      @Query('limit') limit: string,
      @Query('search') search: string,
      @Query('category') category: string,
    ) {
      const queries = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        category
      };
  
      return this.subcategoryService.findAllWithPagination(queries);
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
