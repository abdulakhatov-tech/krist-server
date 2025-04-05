import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto';

@Controller('products')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    @Get()
    async findAll(
        @Query('page') page: string,
         @Query('limit') limit: string,
         @Query('minPrice') minPrice: string,
         @Query('maxPrice') maxPrice: string,
        ) {
            const queries = {
                page: parseInt(page),
                limit: parseInt(limit),
                minPrice: Number(minPrice), 
                maxPrice: Number(maxPrice)
            }

        return this.productService.findAll(queries);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.productService.findById(id)
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateProductDto: CreateProductDto) {
        return this.productService.editProduct(id, updateProductDto)
    }

    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productService.createProduct(createProductDto);
    }
}
