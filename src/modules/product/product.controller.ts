import { Body, Controller, Get, Post, Query } from '@nestjs/common';

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

    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productService.createProduct(createProductDto);
    }
}
