import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UpdateCategoryDto } from './dto';
import { Category } from 'src/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<ResponseType<Category[]>> {
    const categories = await this.categoryRepository.find();

    return {
      success: true,
      message: 'Categories fetched successfully.',
      data: categories,
    };
  }

  async findBySlug(slug: string): Promise<ResponseType<Category>> {
    const category = await this.findCategoryOrFail(slug);

    return {
      success: true,
      message: 'Category found successfully.',
      data: category,
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
    slug: string,
    dto: UpdateCategoryDto,
  ): Promise<ResponseType<Category>> {
    const category = await this.findCategoryOrFail(slug);

    Object.assign(category, dto);
    const updatedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category updated successfully.',
      data: updatedCategory,
    };
  }

  async deleteCategory(slug: string): Promise<ResponseType> {
    const category = await this.findCategoryOrFail(slug);
    await this.categoryRepository.delete(category.id);

    return {
      success: true,
      message: 'Category deleted successfully.',
    };
  }

  // Helper method to find a category by slug or throw NotFoundException
  private async findCategoryOrFail(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { slug } });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found.`);
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
