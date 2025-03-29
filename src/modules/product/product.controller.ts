import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

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
}
