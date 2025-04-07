import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ProductService } from './product.service';
import { CreateProductDto, EditProductDto, EditStockDto } from './dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
    @Query('category') category: string,
    @Query('subcategory') subcategory: string,
    @Query('search') search: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const queries = {
      page: parseInt(page),
      limit: parseInt(limit),
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      category,
      subcategory,
      search,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.productService.findAll(queries);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: EditProductDto,
  ) {
    return this.productService.editProduct(id, updateProductDto);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Patch('/stock/:id')
  async editStock(@Param("id") id: string, @Body() editStockDto: EditStockDto[]) {
    return this.productService.editStock(id, editStockDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id)
  }
}
