import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subcategory } from 'src/entities';
import { SubcategoryService } from './subcategory.service';
import { SubcategoryController } from './subcategory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subcategory])],
  providers: [SubcategoryService],
  controllers: [SubcategoryController],
  exports: [SubcategoryService]
})
export class SubcategoryModule {}
