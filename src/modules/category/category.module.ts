import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { Category } from 'src/entities/category.entity';
import { CategoryController } from './category.controller';
import { Subcategory } from 'src/entities/subcategory.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Subcategory])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService]
})
export class CategoryModule {}
