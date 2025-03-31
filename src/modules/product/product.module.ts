import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Category, Color, Product, Size, Stock, Subcategory, User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Subcategory, User, Color, Size, Stock])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}
