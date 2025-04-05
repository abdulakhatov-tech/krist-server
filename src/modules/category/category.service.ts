import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UpdateCategoryDto } from './dto';
import { Subcategory } from 'src/entities';
import { Category } from 'src/entities/category.entity';
import { ResponseType } from 'src/common/interfaces/general';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<ResponseType<Category[]>> {
    const categories = await this.categoryRepository.find({
      relations: ['subcategories'],
    });

    return {
      success: true,
      message: 'Categories fetched successfully.',
      data: categories,
    };
  }

  async findById(id: string): Promise<ResponseType<Category>> {
    const category = await this.findCategoryOrFail(id);

    return {
      success: true,
      message: 'Category found successfully.',
      data: category,
    };
  }

  async findSubCategoriesByCategorySlug(
    slug: string,
  ): Promise<ResponseType<Subcategory[]>> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['subcategories'],
    });

    if (!category) {
      throw new NotFoundException(`Category not found.`);
    }

    return {
      success: true,
      message: 'Subcategories fetched successfully.',
      data: category.subcategories,
    };
  }

  async createCategory(
    dto: CreateCategoryDto,
  ): Promise<ResponseType<Category>> {
    await this.ensureSlugDoesNotExist(dto.slug);

    const category = this.categoryRepository.create(dto);
    await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category created successfully.',
      data: category,
    };
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<ResponseType<Category>> {
    const category = await this.findCategoryOrFail(id);

    Object.assign(category, dto);
    const updatedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category updated successfully.',
      data: updatedCategory,
    };
  }

  async deleteCategory(id: string): Promise<ResponseType> {
    const category = await this.findCategoryOrFail(id);
    await this.categoryRepository.delete(category.id);

    return {
      success: true,
      message: 'Category deleted successfully.',
    };
  }

  // Helper method to find a category by slug or throw NotFoundException
  private async findCategoryOrFail(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category not found.`);
    }

    return category;
  }

  // Helper method to ensure a category slug does not already exist
  private async ensureSlugDoesNotExist(slug: string): Promise<void> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with slug "${slug}" already exists.`,
      );
    }
  }
}
